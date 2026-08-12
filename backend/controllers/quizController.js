import mongoose from 'mongoose';
import QuizSession from '../models/QuizSession.js';
import QuizResult from '../models/QuizResult.js';
import Topic from '../models/Topic.js';
import SkillGap from '../models/SkillGap.js';
import User from '../models/userModel.js';
import huggingFaceService from '../services/huggingFaceService.js';
import aiService from '../services/aiService.js';
import Settings from '../models/Settings.js';
import { skillsAssessedBy } from '../utils/skillTopicMap.js';
import { reviewQueue } from '../utils/reviewSchedule.js';
import { topicsForRole } from '../utils/roleTopicMap.js';
import { careerPathFor } from '../utils/careerRoles.js';
import { dropDuplicates, balanceDifficulty } from '../utils/questionQuality.js';
import { scoreConfidence } from '../utils/scoreConfidence.js';
import { scoreImpact } from '../utils/scoreImpact.js';

/**
 * How far back to look for questions this learner has already been asked.
 *
 * Far enough that a retake is a genuinely different quiz, near enough that a
 * topic does not eventually run out of things to ask. Questions are generated
 * fresh each time rather than drawn from a bank, so this only has to outlast
 * the period in which somebody would remember an answer.
 */
const RECENT_SESSIONS_FOR_DEDUPE = 5;

/**
 * Turn a raw generation into the questions a learner will actually see.
 *
 * Nothing checked what the model returned. A set of ten could ask the same
 * thing twice in slightly different words, and retaking a topic could hand
 * back the questions just answered — measuring memory of last week's quiz
 * rather than the skill. It was also pitched entirely at one level, so a
 * score could not tell "knows the basics" apart from "knows this well".
 *
 * Both are preferences rather than guarantees: if dropping duplicates would
 * leave too few questions, a shorter quiz is better than a repetitive one,
 * but an empty quiz is worse than either — so the shortfall is reported and
 * the quiz goes ahead with what is left.
 */
const prepareQuestions = async ({ userId, topicId, questions, difficulty, count }) => {
  const recent = await QuizSession.find({ userId, topicId })
    .sort({ createdAt: -1 })
    .limit(RECENT_SESSIONS_FOR_DEDUPE)
    .select('questions.question')
    .lean();

  const seen = recent.flatMap((session) =>
    (session.questions || []).map((q) => q.question).filter(Boolean)
  );

  const { kept, dropped } = dropDuplicates(questions, seen);
  const { selected, counts, balanced } = balanceDifficulty(kept, difficulty, Math.min(count, kept.length));

  if (dropped.length > 0) {
    console.log(`🔁 Dropped ${dropped.length} repeated question(s)`);
  }
  if (!balanced) {
    console.log(`⚖️  Difficulty spread not fully met: ${JSON.stringify(counts)}`);
  }

  return { selected, counts, droppedCount: dropped.length };
};

/**
 * The first, best and latest attempts on a topic, beside the one being read.
 *
 * A result page showed one number with nothing to read it against, which is
 * the least useful moment to show a score: the question a learner has after
 * retaking something is whether they have got better, and answering it meant
 * going back to the list and comparing by eye.
 *
 * First and best are the two that matter. First is where they started, and
 * best guards against a bad day reading as a loss of skill — a learner who
 * scored 90 and then 60 has not forgotten anything, they have had one poor
 * attempt, and a page that only compared with the previous one would say
 * otherwise.
 */
const attemptComparison = async (userId, topicId, current) => {
  if (!topicId) return null;

  const history = await QuizResult.find({ userId, topicId })
    .select('percentage correctAnswers totalQuestions createdAt')
    .sort({ createdAt: 1 })
    .lean();

  if (history.length <= 1) return null;

  const shape = (r) => r && ({
    resultId: r._id,
    percentage: r.percentage,
    correctAnswers: r.correctAnswers,
    totalQuestions: r.totalQuestions,
    takenAt: r.createdAt,
  });

  const first = history[0];
  const latest = history[history.length - 1];
  // Ties go to the earlier attempt, so "best" does not appear to move on a
  // repeat of the same score.
  const best = history.reduce((a, b) => (b.percentage > a.percentage ? b : a), history[0]);

  return {
    total: history.length,
    // Which of the three the learner is currently looking at, so the page can
    // avoid telling somebody their best attempt is elsewhere when it is this
    // one.
    viewing: {
      isFirst: String(first._id) === String(current._id),
      isLatest: String(latest._id) === String(current._id),
      isBest: String(best._id) === String(current._id),
    },
    first: shape(first),
    latest: shape(latest),
    best: shape(best),
    changeFromFirst: latest.percentage - first.percentage,
  };
};

/** The session shape for a generated question, including its own difficulty. */
const toSessionQuestion = (q, fallbackDifficulty) => ({
  question: q.question,
  options: q.options,
  correctAnswer: q.options.findIndex((opt) => opt.isCorrect),
  explanation: q.explanation,
  tags: q.tags || [],
  difficulty: ['beginner', 'intermediate', 'advanced'].includes(q.difficulty)
    ? q.difficulty
    : fallbackDifficulty,
});
import Roadmap from '../models/Roadmap.js';



/**
 * Roadmap skills this result could settle, if the learner agrees.
 *
 * Marking a skill done has always been self-reported, and a pass on the quiz
 * that covers it is the best evidence the product has — but it is offered
 * rather than applied, because the learner is the one who knows whether they
 * can actually do it. Only skills still outstanding, and only on a pass:
 * failing a quiz is not an invitation to tick anything.
 *
 * Shared by the submit response and the result page, so an offer cannot
 * appear in one and not the other.
 */
const outstandingRoadmapSkills = async (userId, topicName, percentage) => {
  const covered = skillsAssessedBy(topicName);
  if (!(percentage >= 70) || covered.length === 0) return [];

  try {
    const plan = await Roadmap.findOne({
      user_id: userId,
      status: { $in: ['active', 'completed'] },
    })
      .sort({ createdAt: -1 })
      .select('skills')
      .lean();

    return (plan?.skills || [])
      .filter((s) => covered.includes(s.skill) && s.status !== 'completed')
      .map((s) => s.skill);
  } catch (error) {
    // No plan is the ordinary case for someone who has not generated one,
    // and must never fail the thing it is decorating.
    console.error('Could not read roadmap skills:', error.message);
    return [];
  }
};

/**
 * Get quiz session details (for resuming or viewing)
 * GET /api/quiz/session/:sessionId
 */
export const getQuizSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await QuizSession.findById(sessionId)
      .populate('topicId', 'name icon description');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Quiz session not found'
      });
    }

    // Verify ownership
    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to quiz session'
      });
    }

    // Return sanitized questions (without correct answers)
    const sanitizedQuestions = session.questions.map(q => ({
      question: q.question,
      options: q.options.map(opt => ({ text: opt.text })),
      tags: q.tags,
    }));

    // Answers as the quiz page holds them: one slot per question, undefined
    // where nothing was chosen. Sent back so reopening a session resumes it
    // rather than starting from an empty form.
    const savedAnswers = new Array(session.totalQuestions).fill(null);
    for (const answer of session.answers || []) {
      if (answer.questionIndex >= 0 && answer.questionIndex < savedAnswers.length) {
        savedAnswers[answer.questionIndex] = answer.selectedOptionIndex;
      }
    }

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        topic: session.topicId,
        difficulty: session.difficultySelected,
        experienceLevel: session.experienceLevelSelected,
        totalQuestions: session.totalQuestions,
        status: session.status,
        questions: sanitizedQuestions,
        startedAt: session.startedAt,
        savedAnswers,
        markedForReview: session.markedForReview || [],
        progressSavedAt: session.progressSavedAt || null,
        timeElapsed: session.completedAt
          ? Math.floor((new Date(session.completedAt) - new Date(session.startedAt)) / 1000)
          : Math.floor((Date.now() - new Date(session.startedAt)) / 1000),
      },
    });

  } catch (error) {
    console.error('❌ Error fetching quiz session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz session',
      message: error.message,
    });
  }
};

/**
 * Get quiz result details
 * GET /api/quiz/result/:resultId
 */
export const getQuizResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user._id;

    const result = await QuizResult.findById(resultId)
      .populate('topicId', 'name icon description')
      .populate('quizSessionId');

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Quiz result not found'
      });
    }

    // Verify ownership
    if (result.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to quiz result'
      });
    }

    const roadmapSkills = await outstandingRoadmapSkills(
      userId,
      result.topicId?.name,
      result.percentage
    );

    const attempts = await attemptComparison(userId, result.topicId?._id, result);

    res.json({
      success: true,
      data: {
        resultId: result._id,
        roadmapSkills,
        topic: result.topicId,
        difficulty: result.difficulty,
        experienceLevel: result.experienceLevel,
        score: Math.round(result.score),
        percentage: result.percentage,
        status: result.status,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeTaken: result.timeTaken,
        performance: getPerformanceLevel(result.percentage),
        detailedAnswers: result.answers,
        completedAt: result.createdAt,
        impact: scoreImpact(result.topicId?.name, result.percentage),
        confidence: scoreConfidence(result.correctAnswers, result.totalQuestions),
        attempts,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching quiz result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz result',
      message: error.message,
    });
  }
};

/**
 * Save progress part-way through a quiz.
 * PUT /api/quiz/session/:sessionId/progress
 *
 * The whole quiz used to live in React state, so a refresh, a closed tab or a
 * phone locking itself threw away every answer given — and left the session
 * "ongoing", so the only way forward was to abandon it and start again on a
 * fresh set of questions with the clock reset. Someone eight questions into
 * ten lost all eight.
 *
 * Answers only. The score is still computed on submit from the questions the
 * server holds, so nothing here can be used to award marks: sending a
 * hundred answers, or answers to questions that do not exist, changes what is
 * restored to that learner's own screen and nothing else.
 */
export const saveQuizProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers, markedForReview } = req.body;
    const userId = req.user._id;

    const session = await QuizSession.findById(sessionId).select(
      'userId status totalQuestions expiresAt answers markedForReview progressSavedAt'
    );

    if (!session) {
      return res.status(404).json({ success: false, error: 'Quiz session not found' });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized access to quiz session' });
    }

    // A finished or abandoned quiz cannot take more answers. Answering 200 to
    // an expired session and then submitting is exactly the hole this closes.
    if (session.status !== 'ongoing') {
      return res.status(409).json({
        success: false,
        error: `This quiz is ${session.status} and can no longer be changed.`,
      });
    }

    // Positions outside the quiz, and choices outside the four options, are
    // dropped rather than rejected: a partial save is worth more to the
    // learner than an error, and the submit path scores from the server's own
    // questions regardless.
    const cleaned = [];
    const list = Array.isArray(answers) ? answers : [];

    for (let index = 0; index < list.length && index < session.totalQuestions; index += 1) {
      const choice = list[index];
      if (!Number.isInteger(choice) || choice < 0 || choice > 3) continue;
      cleaned.push({ questionIndex: index, selectedOptionIndex: choice, answeredAt: new Date() });
    }

    const marks = (Array.isArray(markedForReview) ? markedForReview : [])
      .filter((n) => Number.isInteger(n) && n >= 0 && n < session.totalQuestions);

    session.answers = cleaned;
    session.markedForReview = [...new Set(marks)];
    session.progressSavedAt = new Date();
    await session.save();

    return res.json({
      success: true,
      data: { saved: cleaned.length, progressSavedAt: session.progressSavedAt },
    });
  } catch (error) {
    console.error('❌ Save quiz progress error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to save quiz progress',
      message: error.message,
    });
  }
};

/**
 * Abandon/Cancel an active quiz session
 * PUT /api/quiz/session/:sessionId/abandon
 */
export const abandonQuiz = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await QuizSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Quiz session not found'
      });
    }

    // Verify ownership
    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to quiz session'
      });
    }

    // Check if already completed or abandoned
    if (session.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        error: `Quiz already ${session.status}`
      });
    }

    // Update session status
    session.status = 'abandoned';
    session.completedAt = new Date();
    await session.save();

    console.log(`⚠️  Quiz session abandoned: ${sessionId}`);

    res.json({
      success: true,
      message: 'Quiz session abandoned successfully',
      data: {
        sessionId: session._id,
        status: session.status,
      },
    });

  } catch (error) {
    console.error('❌ Error abandoning quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to abandon quiz session',
      message: error.message,
    });
  }
};

/**
 * Retry a quiz with same parameters but new questions
 * POST /api/quiz/result/:resultId/retry
 */
export const retryQuiz = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user._id;

    // Get original quiz result
    const originalResult = await QuizResult.findById(resultId);

    if (!originalResult) {
      return res.status(404).json({
        success: false,
        error: 'Quiz result not found'
      });
    }

    // Verify ownership
    if (originalResult.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    // Get topic details
    const topic = await Topic.findById(originalResult.topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    console.log(`\n🔄 Retrying quiz for user ${userId}`);
    console.log(`📚 Topic: ${topic.name}`);
    console.log(`📊 Difficulty: ${originalResult.difficulty}`);

    const settings = await Settings.current();

    if (settings.enableAI === false) {
      return res.status(503).json({
        error: 'Quiz generation is turned off right now. Please try again later.'
      });
    }

    // Generate new questions using same parameters. This is the path where
    // repeats matter most: retrying a topic and being handed the questions
    // just answered tests memory of the last attempt, not the skill.
    const wanted = Math.min(originalResult.totalQuestions, settings.maxQuestions);
    const generated = await huggingFaceService.generateQuizQuestions({
      topic: topic.name,
      difficulty: originalResult.difficulty,
      experienceLevel: originalResult.experienceLevel,
      questionCount: Math.min(wanted + 3, settings.maxQuestions),
      basePrompt: settings.basePrompt,
    });

    const { selected: questions } = await prepareQuestions({
      userId,
      topicId: originalResult.topicId,
      questions: generated,
      difficulty: originalResult.difficulty,
      count: wanted,
    });

    if (questions.length === 0) {
      return res.status(503).json({
        error: 'Could not put together a new quiz on that topic just now. Please try again.',
      });
    }

    // Expiry follows the configured maximum duration rather than a constant.
    const totalTimeMinutes = Math.min((questions.length * 0.5) + 5, settings.maxDuration);
    const expiresAt = new Date(Date.now() + totalTimeMinutes * 60 * 1000);

    // Create new quiz session
    // Anything the learner left running has run out of time by now — say so
    // before adding another, or the record keeps several quizzes "ongoing"
    // at once and only one of them is.
    await QuizSession.expireOldSessions(userId);

    const newSession = await QuizSession.create({
      userId,
      topicId: originalResult.topicId,
      difficultySelected: originalResult.difficulty,
      experienceLevelSelected: originalResult.experienceLevel,
      questions: questions.map((q) => toSessionQuestion(q, originalResult.difficulty)),
      totalQuestions: questions.length,
      status: 'ongoing',
      startedAt: new Date(),
      expiresAt,
    });

    console.log(`✅ New quiz session created: ${newSession._id}\n`);

    // Return new quiz session
    const sanitizedQuestions = newSession.questions.map(q => ({
      question: q.question,
      options: q.options.map(opt => ({ text: opt.text })),
      tags: q.tags,
    }));

    res.status(201).json({
      success: true,
      message: 'Quiz retry started with new AI-generated questions',
      data: {
        sessionId: newSession._id,
        topic: {
          id: topic._id,
          name: topic.name,
        },
        difficulty: newSession.difficultySelected,
        experienceLevel: newSession.experienceLevelSelected,
        totalQuestions: newSession.totalQuestions,
        questions: sanitizedQuestions,
        startedAt: newSession.startedAt,
        previousScore: Math.round(originalResult.score),
      },
    });

  } catch (error) {
    console.error('❌ Error retrying quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retry quiz',
      message: error.message,
    });
  }
};

/**
* Get all active topics with stats
* @route   GET /api/topics
* @access  Public
*/
export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.getAllActiveWithStats();

    // Marked, not filtered. The user's track decides what is worth assessing
    // first, but everything stays selectable — someone should be able to test
    // a skill outside their role without changing their profile to do it.
    const recommended = new Set(topicsForRole(req.user?.target_role));

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics.map((topic) => ({
        ...topic,
        recommended: recommended.has(topic.name),
      })),
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics',
      error: error.message,
    });
  }
};

/**
 * Start a new AI-generated quiz
 * POST /api/quiz/start
 */
export const startQuiz = async (req, res) => {
  try {
    const { topicId, difficulty, experienceLevel, questionCount = 10 } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!topicId || !difficulty || !experienceLevel) {
      return res.status(400).json({
        error: 'topicId, difficulty, and experienceLevel are required'
      });
    }

    // Validate difficulty and experience level
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    const validLevels = ['beginner', 'intermediate', 'advanced'];

    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        error: `Invalid difficulty. Must be: ${validDifficulties.join(', ')}`
      });
    }

    if (!validLevels.includes(experienceLevel)) {
      return res.status(400).json({
        error: `Invalid experienceLevel. Must be: ${validLevels.join(', ')}`
      });
    }

    // Get topic details
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Admin settings are read here rather than only displayed on the settings
    // screen — without this the limits are a form, not a setting.
    const settings = await Settings.current();

    if (settings.enableAI === false) {
      return res.status(503).json({
        error: 'Quiz generation is turned off right now. Please try again later.'
      });
    }

    const requested = parseInt(questionCount, 10) || 10;
    const cappedCount = Math.min(requested, settings.maxQuestions);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 Starting AI Quiz Generation`);
    console.log(`${'='.repeat(60)}`);
    console.log(`👤 User: ${userId}`);
    console.log(`📚 Topic: ${topic.name}`);
    console.log(`📊 Difficulty: ${difficulty}`);
    console.log(`🎓 Experience: ${experienceLevel}`);
    console.log(`🔢 Questions: ${cappedCount}${cappedCount < requested ? ` (capped from ${requested})` : ''}`);
    console.log(`${'='.repeat(60)}\n`);

    // Generate questions using Hugging Face AI. A few more are asked for than
    // will be used, so that dropping repeats does not shorten the quiz.
    const generated = await huggingFaceService.generateQuizQuestions({
      topic: topic.name,
      difficulty,
      experienceLevel,
      questionCount: Math.min(cappedCount + 3, settings.maxQuestions),
      basePrompt: settings.basePrompt,
    });

    const { selected: questions } = await prepareQuestions({
      userId,
      topicId,
      questions: generated,
      difficulty,
      count: cappedCount,
    });

    if (questions.length === 0) {
      return res.status(503).json({
        error: 'Could not put together a quiz on that topic just now. Please try again.',
      });
    }

    // Expiry follows the configured maximum duration rather than a constant.
    const totalTimeMinutes = Math.min((questions.length * 0.5) + 5, settings.maxDuration);
    const expiresAt = new Date(Date.now() + totalTimeMinutes * 60 * 1000);

    // Create quiz session with AI-generated questions
    // Anything the learner left running has run out of time by now — say so
    // before adding another, or the record keeps several quizzes "ongoing"
    // at once and only one of them is.
    await QuizSession.expireOldSessions(userId);

    const quizSession = await QuizSession.create({
      userId,
      topicId,
      difficultySelected: difficulty,
      experienceLevelSelected: experienceLevel,
      questions: questions.map((q) => toSessionQuestion(q, difficulty)),
      totalQuestions: questions.length,
      status: 'ongoing',
      startedAt: new Date(),
      expiresAt,
    });

    console.log(`✅ Quiz session created: ${quizSession._id}\n`);

    // Return quiz session without revealing correct answers
    const sanitizedQuestions = quizSession.questions.map(q => ({
      question: q.question,
      options: q.options.map(opt => ({ text: opt.text })), // Remove isCorrect
      tags: q.tags,
    }));

    res.status(201).json({
      success: true,
      message: 'Quiz started successfully with AI-generated questions',
      data: {
        sessionId: quizSession._id,
        topic: {
          id: topic._id,
          name: topic.name,
        },
        difficulty,
        experienceLevel,
        totalQuestions: quizSession.totalQuestions,
        questions: sanitizedQuestions,
        startedAt: quizSession.startedAt,
      },
    });

  } catch (error) {
    console.error('❌ Error starting quiz:', error);
    res.status(500).json({
      error: 'Failed to start quiz',
      message: error.message,
    });
  }
};

/**
 * Submit quiz answers and calculate results
 * POST /api/quiz/submit
 */
export const submitQuiz = async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!sessionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        error: 'sessionId and answers array are required'
      });
    }

    // Get quiz session
    const session = await QuizSession.findById(sessionId).populate('topicId');

    if (!session) {
      return res.status(404).json({ error: 'Quiz session not found' });
    }

    // Verify ownership
    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to quiz session' });
    }

    // Check if already completed
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Quiz already submitted' });
    }

    // Calculate results
    let correctAnswers = 0;
    const incorrectAnswers = 0;
    const detailedResults = [];

    session.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer;

      if (isCorrect) correctAnswers++;

      detailedResults.push({
        questionIndex: index,
        question: question.question,
        selectedOptionIndex: userAnswer,
        correctOptionIndex: question.correctAnswer,
        userAnswer: userAnswer !== undefined ? question.options[userAnswer]?.text : 'Not answered',
        correctAnswer: question.options[question.correctAnswer].text,
        isCorrect,
        marksAwarded: isCorrect ? 1 : 0,
        timeSpent: 0, // Can be calculated if we track timing
        explanation: question.explanation,
        tags: question.tags,
        // Sessions written before questions carried their own level fall back
        // to the one the learner picked, which is what they all were then.
        difficulty: question.difficulty || session.difficultySelected,
      });
    });

    const totalMarks = session.totalQuestions;
    const score = correctAnswers;
    const percentage = (correctAnswers / session.totalQuestions) * 100;
    const timeTaken = Math.floor((Date.now() - session.startedAt) / 1000); // in seconds

    // Update session
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    // Save quiz result
    const quizResult = await QuizResult.create({
      userId,
      quizSessionId: session._id,
      topicId: session.topicId._id,
      difficulty: session.difficultySelected,
      experienceLevel: session.experienceLevelSelected,
      score,
      totalMarks,
      totalQuestions: session.totalQuestions,
      correctAnswers,
      incorrectAnswers: session.totalQuestions - correctAnswers,
      percentage,
      status: percentage >= 70 ? 'pass' : 'fail',
      timeTaken,
      averageTimePerQuestion: Math.floor(timeTaken / session.totalQuestions),
      answers: detailedResults,
    });

    console.log(`\n✅ Quiz completed: ${session._id}`);
    console.log(`📊 Score: ${percentage.toFixed(2)}%`);
    console.log(`✔️  Correct: ${correctAnswers}/${session.totalQuestions}\n`);

    // Feed this result into the user's running skill-gap profile, which is
    // what roadmap generation reads to personalize which skills it
    // schedules. Only topics with a known mapping to the AI service's
    // canonical skill names are written — see skillTopicMap.js.
    //
    // Only the skills this topic actually assesses. The skills it merely
    // touches are deliberately not recorded: a passing score removes a skill
    // from the roadmap, so writing them let one quiz clear three skills the
    // learner was never asked about.
    const canonicalSkills = skillsAssessedBy(session.topicId.name);
    if (canonicalSkills.length > 0) {
      try {
        await syncSkillGap(userId, canonicalSkills, percentage);
      } catch (error) {
        console.error('Failed to update skill gap profile:', error.message);
      }
    }

    // Calculate difficulty breakdown for AI assessment
    const difficultyBreakdown = calculateDifficultyBreakdown(detailedResults);

    // AI-powered skill assessment. This is awaited, so it does hold up the
    // response — the comment here used to say "async, non-blocking", which it
    // has never been. It is bounded and it falls back, so the cost of a slow
    // AI service is a slower results page rather than a lost result; see the
    // timeout note in services/aiService.js.
    let aiAnalysis = null;
    try {
      // The track this result belongs to. Read here rather than passed in,
      // because the quiz session records the topic and difficulty chosen but
      // never the role — and the role is what decides whether "next steps"
      // point at React or at packet capture.
      const learner = await User.findById(userId).select('target_role').lean();

      const assessmentData = {
        userId: userId.toString(),
        skillName: session.topicId.name,
        normalizedScore: percentage,
        accuracy: percentage,
        difficultyBreakdown,
        answers: detailedResults.map(r => ({
          questionId: r.questionIndex.toString(),
          selectedOption: r.selectedOptionIndex !== undefined ? r.selectedOptionIndex : -1,
          correctOption: r.correctOptionIndex,
          isCorrect: r.isCorrect,
          weight: 1, // Base weight
          difficulty: session.difficultySelected.charAt(0).toUpperCase() + session.difficultySelected.slice(1)
        })),
        careerPath: careerPathFor(learner?.target_role),
        userLevel: session.experienceLevelSelected.charAt(0).toUpperCase() + session.experienceLevelSelected.slice(1)
      };

      const aiResponse = await aiService.assessSkill(assessmentData);
      if (aiResponse.success) {
        aiAnalysis = aiResponse.analysis;
        console.log('✅ AI assessment completed');
      } else {
        console.log('⚠️  AI assessment failed, using fallback');
        aiAnalysis = aiResponse.fallback;
      }
    } catch (error) {
      console.error('❌ AI assessment error:', error.message);
      // Continue without AI analysis
    }

    // Determine performance level
    let performance = 'needs improvement';
    if (percentage >= 90) performance = 'excellent';
    else if (percentage >= 75) performance = 'good';
    else if (percentage >= 70) performance = 'satisfactory';

    // Build response with AI analysis
    const roadmapSkills = await outstandingRoadmapSkills(
      userId,
      session.topicId.name,
      percentage
    );

    const responseData = {
      resultId: quizResult._id,
      roadmapSkills,
      // Why this number matters and how firmly it is known. Both were
      // decided here and never said: the topic-to-skill mapping was
      // invisible, and a score from four questions was presented exactly
      // like one from twenty.
      impact: scoreImpact(session.topicId.name, percentage),
      confidence: scoreConfidence(correctAnswers, session.totalQuestions),
      score: correctAnswers,
      percentage: Math.round(percentage),
      correctAnswers,
      totalQuestions: session.totalQuestions,
      status: quizResult.status,
      timeTaken,
      topic: {
        id: session.topicId._id,
        name: session.topicId.name,
      },
      detailedResults: detailedResults.map(r => ({
        question: r.question,
        userAnswer: r.userAnswer,
        correctAnswer: r.correctAnswer,
        isCorrect: r.isCorrect,
        explanation: r.explanation,
      })),
      performance,
    };

    // Add AI analysis if available
    if (aiAnalysis) {
      responseData.aiAnalysis = aiAnalysis;
    }

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: responseData,
    });

  } catch (error) {
    console.error('❌ Error submitting quiz:', error);
    res.status(500).json({
      error: 'Failed to submit quiz',
      message: error.message,
    });
  }
};

/** Coarser bands than pass/fail — this drives how urgently the roadmap
 *  generator schedules the skill, not just whether the quiz was passed. */
const gapSeverity = (score) => {
  if (score < 40) return 'critical';
  if (score < 60) return 'high';
  if (score < 75) return 'medium';
  return 'low';
};

// Matches the pass/fail threshold QuizResult already uses.
const REQUIRED_SCORE = 70;

/**
 * Upserts the user's running SkillGap document for their current target role:
 * sets/replaces the score and gap entry for each canonical skill this topic
 * covers, then recomputes strength_score from everything on record.
 *
 * Scoped per role because the skill names differ between curricula — mixing
 * a MERN score into an AI/ML document would leave entries the roadmap
 * generator can never match.
 */
const syncSkillGap = async (userId, canonicalSkills, score) => {
  const roundedScore = Math.round(score);
  const severity = gapSeverity(roundedScore);

  const user = await User.findById(userId).select('target_role');
  const targetRole = user?.target_role || 'Unspecified';

  let skillGap = await SkillGap.findOne({ user_id: userId, target_role: targetRole })
    .sort({ createdAt: -1 });
  if (!skillGap) {
    skillGap = new SkillGap({
      user_id: userId,
      target_role: targetRole,
      skill_gaps: [],
    });
  }

  for (const skill of canonicalSkills) {
    const entry = {
      skill,
      gap_severity: severity,
      current_score: roundedScore,
      required_score: REQUIRED_SCORE,
    };
    const existingIndex = skillGap.skill_gaps.findIndex((g) => g.skill === skill);
    if (existingIndex >= 0) {
      skillGap.skill_gaps[existingIndex] = entry;
    } else {
      skillGap.skill_gaps.push(entry);
    }
  }

  const scores = skillGap.skill_gaps.map((g) => g.current_score ?? 0);
  skillGap.strength_score = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;

  await skillGap.save();
};

/**
 * Get performance level based on score
 */
const getPerformanceLevel = (score) => {
  if (score >= 90) return { level: 'Excellent', message: 'Outstanding performance! 🌟' };
  if (score >= 75) return { level: 'Good', message: 'Great job! Keep it up! 👍' };
  if (score >= 60) return { level: 'Average', message: 'Good effort! Room for improvement. 📚' };
  return { level: 'Needs Improvement', message: 'Keep practicing! You can do better! 💪' };
};

/**
 * Calculate difficulty breakdown from quiz results
 * Maps answer details to difficulty categories
 */
const calculateDifficultyBreakdown = (detailedResults) => {
  const breakdown = {
    beginner: { attempted: 0, correct: 0, accuracy: 0 },
    intermediate: { attempted: 0, correct: 0, accuracy: 0 },
    advanced: { attempted: 0, correct: 0, accuracy: 0 }
  };

  // This used to look for a difficulty inside `tags` and default to
  // 'beginner' when it found none. It never found one: the generator puts the
  // topic name in tags, never a level — so every question in every quiz was
  // counted as beginner, and the breakdown handed to the assessment agent was
  // always 100% beginner and nothing else, whatever the learner had sat.
  //
  // Questions carry their own difficulty now, and that is what this reads.
  detailedResults.forEach(result => {
    const difficulty = ['beginner', 'intermediate', 'advanced'].includes(result.difficulty)
      ? result.difficulty
      : 'beginner';

    breakdown[difficulty].attempted++;
    if (result.isCorrect) {
      breakdown[difficulty].correct++;
    }
  });

  // Calculate accuracy percentages
  Object.keys(breakdown).forEach(level => {
    if (breakdown[level].attempted > 0) {
      breakdown[level].accuracy = (breakdown[level].correct / breakdown[level].attempted) * 100;
    }
  });

  return breakdown;
};

/**
 * Get quiz history for user
 * GET /api/quiz/history
 */
export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { topicId, difficulty, limit = 20, page = 1 } = req.query;

    const query = { userId };
    if (topicId) query.topicId = topicId;
    if (difficulty) query.difficulty = difficulty;

    const results = await QuizResult.find(query)
      .populate('topicId', 'name icon')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await QuizResult.countDocuments(query);

    res.json({
      success: true,
      data: {
        results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });

  } catch (error) {
    console.error('❌ Error fetching quiz history:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
};

/**
 * Get quiz statistics
 * GET /api/quiz/stats
 */
export const getQuizStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await QuizResult.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          // averageScore is rendered as a percentage ("N/100") — score is
          // raw marks out of totalMarks, not 0-100, so averaging it directly
          // showed e.g. 2/100 for a quiz whose real result was 40/100.
          averageScore: { $avg: '$percentage' },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrect: { $sum: '$correctAnswers' },
        },
      },
    ]);

    const topicPerformance = await QuizResult.aggregate([
      { $match: { userId } },
      // Oldest first so $first/$last are the earliest and most recent attempt.
      // Every attempt is already on record here, so improvement is derived
      // rather than stored — a second copy of these scores could disagree
      // with the results they came from.
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$topicId',
          quizCount: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' },
          firstScore: { $first: '$percentage' },
          latestScore: { $last: '$percentage' },
          firstAt: { $first: '$createdAt' },
          latestAt: { $last: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: '_id',
          as: 'topic',
        },
      },
      { $unwind: '$topic' },
      {
        $project: {
          topicName: '$topic.name',
          topicIcon: '$topic.icon',
          quizCount: 1,
          averageScore: { $round: ['$averageScore', 2] },
          bestScore: { $round: ['$bestScore', 2] },
          firstScore: { $round: ['$firstScore', 0] },
          latestScore: { $round: ['$latestScore', 0] },
          firstAt: 1,
          latestAt: 1,
        },
      },
      // Biggest movement first, so what changed leads.
      { $sort: { quizCount: -1, latestAt: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalQuizzes: 0,
          averageScore: 0,
          totalQuestions: 0,
          totalCorrect: 0,
        },
        topicPerformance,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching quiz stats:', error);
    res.status(500).json({ error: 'Failed to fetch quiz statistics' });
  }
};

/**
 * GET /api/quiz/review-queue — topics worth going back to.
 *
 * Every attempt has always been stored and nothing ever read it back. The
 * history screen lists attempts; nothing said "you scored 40% on this five
 * weeks ago and have not touched it since", which is the one thing that record
 * is good for.
 *
 * Built from the same aggregation the stats screen uses, so a topic's latest
 * score cannot differ between the two.
 */
export const getReviewQueue = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const topicPerformance = await QuizResult.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$topicId',
          latestScore: { $last: '$percentage' },
          latestAt: { $last: '$createdAt' },
          attempts: { $sum: 1 },
          // Mastery reads the whole history, not the last attempt. Judging a
          // topic by its most recent score alone treats somebody who has
          // passed four times running and somebody who scraped one pass as
          // the same learner.
          bestScore: { $max: '$percentage' },
          passes: { $sum: { $cond: [{ $gte: ['$percentage', 70] }, 1, 0] } },
          // Carried so the queue can offer the retake directly rather than
          // sending the learner off to find the topic in a list of fifty-four.
          difficulty: { $last: '$difficulty' },
          experienceLevel: { $last: '$experienceLevel' },
        },
      },
      { $lookup: { from: 'topics', localField: '_id', foreignField: '_id', as: 'topic' } },
      { $unwind: '$topic' },
      {
        $project: {
          topicId: '$_id',
          topicName: '$topic.name',
          latestScore: { $round: ['$latestScore', 0] },
          bestScore: { $round: ['$bestScore', 0] },
          latestAt: 1,
          attempts: 1,
          passes: 1,
          difficulty: 1,
          experienceLevel: 1,
        },
      },
    ]);

    const due = reviewQueue(topicPerformance);

    res.json({
      success: true,
      data: {
        due,
        // So the screen can say "nothing due" rather than "nothing here",
        // which read as though the feature was broken on a fresh account.
        tracked: topicPerformance.length,
      },
    });
  } catch (error) {
    console.error('getReviewQueue error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
