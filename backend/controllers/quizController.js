import QuizSession from '../models/QuizSession.js';
import QuizResult from '../models/QuizResult.js';
import Topic from '../models/Topic.js';
import huggingFaceService from '../services/huggingFaceService.js';


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

    res.json({
      success: true,
      data: {
        resultId: result._id,
        topic: result.topicId,
        difficulty: result.difficulty,
        experienceLevel: result.experienceLevel,
        score: Math.round(result.score),
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeTaken: result.timeTaken,
        performance: getPerformanceLevel(result.score),
        detailedAnswers: result.answers,
        completedAt: result.createdAt,
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

    // Generate new questions using same parameters
    const questions = await huggingFaceService.generateQuizQuestions({
      topic: topic.name,
      difficulty: originalResult.difficulty,
      experienceLevel: originalResult.experienceLevel,
      questionCount: originalResult.totalQuestions,
    });

    // Calculate expiration time (30 minutes per question + 5 min buffer)
    const totalTimeMinutes = (questions.length * 0.5) + 5;
    const expiresAt = new Date(Date.now() + totalTimeMinutes * 60 * 1000);

    // Create new quiz session
    const newSession = await QuizSession.create({
      userId,
      topicId: originalResult.topicId,
      difficultySelected: originalResult.difficulty,
      experienceLevelSelected: originalResult.experienceLevel,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.options.findIndex(opt => opt.isCorrect),
        explanation: q.explanation,
        tags: q.tags || [],
      })),
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

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
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

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 Starting AI Quiz Generation`);
    console.log(`${'='.repeat(60)}`);
    console.log(`👤 User: ${userId}`);
    console.log(`📚 Topic: ${topic.name}`);
    console.log(`📊 Difficulty: ${difficulty}`);
    console.log(`🎓 Experience: ${experienceLevel}`);
    console.log(`🔢 Questions: ${questionCount}`);
    console.log(`${'='.repeat(60)}\n`);

    // Generate questions using Hugging Face AI
    const questions = await huggingFaceService.generateQuizQuestions({
      topic: topic.name,
      difficulty,
      experienceLevel,
      questionCount: parseInt(questionCount),
    });

    // Calculate expiration time (30 minutes per question + 5 min buffer)
    const totalTimeMinutes = (questions.length * 0.5) + 5;
    const expiresAt = new Date(Date.now() + totalTimeMinutes * 60 * 1000);

    // Create quiz session with AI-generated questions
    const quizSession = await QuizSession.create({
      userId,
      topicId,
      difficultySelected: difficulty,
      experienceLevelSelected: experienceLevel,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.options.findIndex(opt => opt.isCorrect),
        explanation: q.explanation,
        tags: q.tags || [],
      })),
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
      status: percentage >= 60 ? 'pass' : 'fail',
      timeTaken,
      averageTimePerQuestion: Math.floor(timeTaken / session.totalQuestions),
      answers: detailedResults,
    });

    console.log(`\n✅ Quiz completed: ${session._id}`);
    console.log(`📊 Score: ${percentage.toFixed(2)}%`);
    console.log(`✔️  Correct: ${correctAnswers}/${session.totalQuestions}\n`);

    // Determine performance level
    let performance = 'needs improvement';
    if (percentage >= 90) performance = 'excellent';
    else if (percentage >= 75) performance = 'good';
    else if (percentage >= 60) performance = 'satisfactory';

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        resultId: quizResult._id,
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
      },
    });

  } catch (error) {
    console.error('❌ Error submitting quiz:', error);
    res.status(500).json({
      error: 'Failed to submit quiz',
      message: error.message,
    });
  }
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
          averageScore: { $avg: '$score' },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrect: { $sum: '$correctAnswers' },
        },
      },
    ]);

    const topicPerformance = await QuizResult.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$topicId',
          quizCount: { $sum: 1 },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
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
        },
      },
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