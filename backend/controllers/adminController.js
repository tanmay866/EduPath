import User from '../models/userModel.js';
import { purgeUserData } from '../utils/purgeUserData.js';
import QuizResult from '../models/QuizResult.js';
import PracticeResult from '../models/PracticeResult.js';
import InterviewResult from '../models/InterviewResult.js';
import Roadmap from '../models/Roadmap.js';
import Topic from '../models/Topic.js';
import Settings from '../models/Settings.js';

/**
 * Admin reporting.
 *
 * Every figure here is a query. Where the data to answer a question does not
 * exist — AI call volume, token spend — the endpoint says so rather than
 * returning a plausible number, and the screen renders that as an empty state.
 */

const DAY = 24 * 60 * 60 * 1000;

/** Percentage change between two windows, or null when there is no baseline. */
const delta = (current, previous) => {
  if (!previous) return null;
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? '+' : ''}${change}%`;
};

/**
 * GET /api/admin/overview
 *
 * Counts, the change against the previous 30 days, the topic and difficulty
 * distributions, and the most recent attempts.
 */
export const getOverview = async (req, res) => {
  try {
    const now = Date.now();
    const last30 = new Date(now - 30 * DAY);
    const prev30 = new Date(now - 60 * DAY);

    const [
      users, usersLast30, usersPrev30,
      quizAttempts, quizLast30, quizPrev30,
      practiceAttempts, practiceLast30, practicePrev30,
      interviewAttempts, interviewLast30, interviewPrev30,
      roadmaps, roadmapsLast30, roadmapsPrev30,
      skillUsage, practiceUsage, interviewUsage,
      difficultySplit, practiceDifficultySplit,
      recent,
      activeLearners, activeLearnersPrev30,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: last30 } }),
      User.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

      QuizResult.countDocuments({}),
      QuizResult.countDocuments({ createdAt: { $gte: last30 } }),
      QuizResult.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

      PracticeResult.countDocuments({}),
      PracticeResult.countDocuments({ createdAt: { $gte: last30 } }),
      PracticeResult.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

      InterviewResult.countDocuments({}),
      InterviewResult.countDocuments({ createdAt: { $gte: last30 } }),
      InterviewResult.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

      Roadmap.countDocuments({}),
      Roadmap.countDocuments({ createdAt: { $gte: last30 } }),
      Roadmap.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

      QuizResult.aggregate([
        { $group: { _id: '$topicId', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 6 },
      ]),

      PracticeResult.aggregate([
        { $group: { _id: '$type', value: { $sum: 1 } } },
      ]),

      InterviewResult.countDocuments({}),

      QuizResult.aggregate([
        { $group: { _id: '$difficulty', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]),

      PracticeResult.aggregate([
        { $match: { difficulty: { $ne: null } } },
        { $group: { _id: '$difficulty', value: { $sum: 1 } } },
      ]),

      getRecentAttempts(8),

      countActiveLearners(last30),
      countActiveLearners(prev30, last30),
    ]);

    // Topic ids mean nothing on screen, so they are resolved to names here.
    const topicIds = skillUsage.map((row) => row._id).filter(Boolean);
    const topics = await Topic.find({ _id: { $in: topicIds } }).select('name').lean();
    const topicName = new Map(topics.map((topic) => [String(topic._id), topic.name]));

    // Aptitude/CS Fundamentals don't carry a topicId, and the mock interview
    // isn't tied to a topic at all — each gets its own bar instead of being
    // dropped from "attempts by topic".
    const combinedUsage = [
      ...skillUsage.map((row) => ({
        label: topicName.get(String(row._id)) || 'Untagged',
        value: row.value,
      })),
      ...practiceUsage.map((row) => ({
        label: PRACTICE_TYPE_LABELS[row._id] || row._id,
        value: row.value,
      })),
    ];
    if (interviewUsage > 0) {
      combinedUsage.push({ label: 'Mock interview', value: interviewUsage });
    }
    combinedUsage.sort((a, b) => b.value - a.value);

    const combinedDifficulty = mergeDifficultySplits(difficultySplit, practiceDifficultySplit);

    return res.status(200).json({
      success: true,
      data: {
        stats: [
          { label: 'Users', value: users, delta: delta(usersLast30, usersPrev30) },
          {
            label: 'Assessment attempts',
            value: quizAttempts + practiceAttempts + interviewAttempts,
            delta: delta(
              quizLast30 + practiceLast30 + interviewLast30,
              quizPrev30 + practicePrev30 + interviewPrev30
            ),
          },
          { label: 'Roadmaps', value: roadmaps, delta: delta(roadmapsLast30, roadmapsPrev30) },
          // Learners who actually did something, not accounts an admin has
          // not blocked. This counted isActive, which is the moderation flag
          // the block button flips — true for everyone else, so the cell
          // silently repeated the "Users" figure beside it under a label that
          // reads as engagement.
          { label: 'Active learners', value: activeLearners, delta: delta(activeLearners, activeLearnersPrev30) },
        ],
        skillUsage: combinedUsage.slice(0, 6),
        difficultySplit: combinedDifficulty,
        attempts: recent,
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load overview' });
  }
};

/**
 * Distinct users with at least one attempt of any kind in a window.
 *
 * Counted across the three result collections and de-duplicated here rather
 * than summed — one person who took a quiz, an aptitude test and an interview
 * is one active learner, not three.
 */
const countActiveLearners = async (since, until) => {
  const range = until ? { $gte: since, $lt: until } : { $gte: since };
  const idSets = await Promise.all(
    [QuizResult, PracticeResult, InterviewResult].map((Model) =>
      Model.distinct('userId', { createdAt: range })
    )
  );
  return new Set(idSets.flat().filter(Boolean).map(String)).size;
};

const PRACTICE_TYPE_LABELS = { aptitude: 'Aptitude', 'cs-fundamentals': 'CS Fundamentals' };

const capitalize = (value) => (value ? value[0].toUpperCase() + value.slice(1) : 'Untagged');

/** Same difficulty label, whichever collection it came from, summed together. */
const mergeDifficultySplits = (...splits) => {
  const totals = new Map();
  for (const split of splits) {
    for (const row of split) {
      const label = capitalize(row._id);
      totals.set(label, (totals.get(label) || 0) + row.value);
    }
  }
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

const shapeQuizAttempt = (result) => ({
  _id: String(result._id),
  userName: result.userId
    ? `${result.userId.firstName || ''} ${result.userId.lastName || ''}`.trim() || result.userId.email
    : 'Deleted user',
  skill: result.topicId?.name || 'Untagged',
  difficulty: capitalize(result.difficulty),
  score: result.correctAnswers ?? result.score ?? 0,
  totalQuestions: result.totalQuestions ?? 0,
  createdAt: result.completedAt || result.createdAt,
});

const shapePracticeAttempt = (result) => ({
  _id: String(result._id),
  userName: result.userId
    ? `${result.userId.firstName || ''} ${result.userId.lastName || ''}`.trim() || result.userId.email
    : 'Deleted user',
  skill: PRACTICE_TYPE_LABELS[result.type] || result.type,
  difficulty: capitalize(result.difficulty),
  score: result.correct ?? 0,
  totalQuestions: result.total ?? 0,
  createdAt: result.createdAt,
});

/** Interview scores run 0–10 rather than out of a question count, so they are
 *  rescaled to /10 the way the rest of the table expects a total to work. */
const shapeInterviewAttempt = (result) => ({
  _id: String(result._id),
  userName: result.userId
    ? `${result.userId.firstName || ''} ${result.userId.lastName || ''}`.trim() || result.userId.email
    : 'Deleted user',
  skill: result.role || 'Interview',
  difficulty: 'Interview',
  score: result.overallScore ?? 0,
  totalQuestions: 10,
  createdAt: result.createdAt,
});

/**
 * The `limit` most recent attempts across all three assessment types.
 *
 * Each collection is independently sorted and capped at `limit` before the
 * merge, which is enough: the true top-`limit` across three already-sorted
 * streams can never reach further than `limit` into any one of them.
 */
const getRecentAttempts = async (limit) => {
  const [quiz, practice, interview] = await Promise.all([
    QuizResult.find({}).sort({ createdAt: -1 }).limit(limit)
      .populate('userId', 'firstName lastName email')
      .populate('topicId', 'name')
      .lean(),
    PracticeResult.find({}).sort({ createdAt: -1 }).limit(limit)
      .populate('userId', 'firstName lastName email')
      .lean(),
    InterviewResult.find({}).sort({ createdAt: -1 }).limit(limit)
      .populate('userId', 'firstName lastName email')
      .lean(),
  ]);

  return [
    ...quiz.map(shapeQuizAttempt),
    ...practice.map(shapePracticeAttempt),
    ...interview.map(shapeInterviewAttempt),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

/** GET /api/admin/attempts */
export const getAttempts = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await getRecentAttempts(200) });
  } catch (error) {
    console.error('Admin attempts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load attempts' });
  }
};

/** GET /api/admin/users */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('firstName lastName email isActive createdAt role loginId')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({
      success: true,
      data: users.map((user) => ({
        _id: String(user._id),
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.loginId,
        email: user.email,
        role: user.role,
        // isActive is the flag the model already carries; "blocked" is how the
        // admin screen talks about it.
        isBlocked: user.isActive === false,
        // Whether this row is the admin reading it, decided by the server
        // rather than by the browser comparing against a stored id. A session
        // that predates that value being stored, or one cleared since, left
        // the client thinking no row was its own — so the guard on Block and
        // Delete quietly stopped applying and the buttons looked live.
        isSelf: String(user._id) === String(req.user._id),
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load users' });
  }
};

/** PATCH /api/admin/users/:id/block — flips isActive. */
export const toggleUserBlock = async (req, res) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot block your own account' });
    }

    const user = await User.findById(req.params.id).select('isActive');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = user.isActive === false;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      data: { _id: String(user._id), isBlocked: user.isActive === false },
    });
  } catch (error) {
    console.error('Admin block error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

/** DELETE /api/admin/users/:id */
export const deleteUser = async (req, res) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account here' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Their work goes with them, and now it actually does: this used to
    // remove four collections of the twelve an account owns and leave the
    // rest orphaned — including the portfolio, which went on resolving
    // publicly for someone who no longer existed.
    const removed = await purgeUserData(user._id);

    return res.status(200).json({ success: true, message: 'User deleted', removed });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

/** GET /api/admin/roadmaps */
export const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('user_id', 'firstName lastName email')
      .lean();

    return res.status(200).json({
      success: true,
      data: roadmaps.map((roadmap) => {
        const skills = roadmap.skills || [];
        const done = skills.filter((skill) => skill.status === 'completed').length;

        return {
          _id: String(roadmap._id),
          userName: roadmap.user_id
            ? `${roadmap.user_id.firstName || ''} ${roadmap.user_id.lastName || ''}`.trim() || roadmap.user_id.email
            : 'Deleted user',
          skill: roadmap.target_role,
          level: roadmap.experience_level
            ? roadmap.experience_level[0].toUpperCase() + roadmap.experience_level.slice(1)
            : 'Untagged',
          weeks: roadmap.total_duration_weeks || 0,
          // Real completion, counted from the skills themselves.
          progress: skills.length ? Math.round((done / skills.length) * 100) : 0,
          createdAt: roadmap.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error('Admin roadmaps error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load roadmaps' });
  }
};

/**
 * GET /api/admin/analytics
 *
 * What the AI has produced, which is countable, rather than how many times it
 * was called or what it cost — nothing logs either of those.
 */
export const getAnalytics = async (req, res) => {
  try {
    const now = Date.now();
    const last30 = new Date(now - 30 * DAY);
    const prev30 = new Date(now - 60 * DAY);
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    const [
      quizzes, quizzesLast30, quizzesPrev30, quizzesToday,
      roadmaps, roadmapsLast30, roadmapsPrev30, roadmapsToday,
      interviews, interviewsLast30, interviewsPrev30, interviewsToday,
      requestedRoles, difficultySplit,
    ] = await Promise.all([
      QuizResult.countDocuments({}),
      QuizResult.countDocuments({ createdAt: { $gte: last30 } }),
      QuizResult.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),
      QuizResult.countDocuments({ createdAt: { $gte: today } }),

      Roadmap.countDocuments({}),
      Roadmap.countDocuments({ createdAt: { $gte: last30 } }),
      Roadmap.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),
      Roadmap.countDocuments({ createdAt: { $gte: today } }),

      // Every question and its evaluation is AI-generated, same as a quiz or
      // a roadmap, so mock interviews belong in this count too.
      InterviewResult.countDocuments({}),
      InterviewResult.countDocuments({ createdAt: { $gte: last30 } }),
      InterviewResult.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),
      InterviewResult.countDocuments({ createdAt: { $gte: today } }),

      Roadmap.aggregate([
        { $group: { _id: '$target_role', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 4 },
      ]),

      QuizResult.aggregate([
        { $group: { _id: '$difficulty', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 3 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: [
          {
            label: 'Generations',
            value: quizzes + roadmaps + interviews,
            delta: delta(
              quizzesLast30 + roadmapsLast30 + interviewsLast30,
              quizzesPrev30 + roadmapsPrev30 + interviewsPrev30
            ),
          },
          // The same three things "Generations" counts. Roadmaps were left out
          // of the daily figure, so a day spent generating nothing but
          // roadmaps reported zero next to a total that included them.
          { label: 'Today', value: quizzesToday + roadmapsToday + interviewsToday, delta: null },
          { label: 'Quizzes made', value: quizzes, delta: delta(quizzesLast30, quizzesPrev30) },
          { label: 'Roadmaps made', value: roadmaps, delta: delta(roadmapsLast30, roadmapsPrev30) },
          { label: 'Interviews made', value: interviews, delta: delta(interviewsLast30, interviewsPrev30) },
        ],
        requestedRoles: requestedRoles.map((row) => ({
          label: row._id || 'Untagged',
          value: row.value,
        })),
        difficultySplit: difficultySplit.map((row) => ({
          label: row._id ? row._id[0].toUpperCase() + row._id.slice(1) : 'Untagged',
          value: row.value,
        })),
        // Nothing records per-call token spend, so the screen is told there is
        // no figure rather than being handed one that looks measured.
        tokenUsage: null,
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
};


/** GET /api/admin/settings */
export const getSettings = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await Settings.current() });
  } catch (error) {
    console.error('Admin settings read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
};

/**
 * PUT /api/admin/settings
 *
 * Only the six fields the screen owns are writable, so a crafted body cannot
 * set updatedBy, timestamps or the document key.
 */
const WRITABLE = ['maxQuestions', 'maxDuration', 'maxModules', 'defaultLevel', 'enableAI', 'basePrompt'];

export const updateSettings = async (req, res) => {
  try {
    const update = { updatedBy: req.user._id };
    for (const field of WRITABLE) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    const settings = await Settings.findOneAndUpdate(
      { key: 'platform' },
      { $set: update, $setOnInsert: { key: 'platform' } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).lean();

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Admin settings write error:', error);
    const message = error.name === 'ValidationError'
      ? Object.values(error.errors)[0]?.message || 'Those values are out of range'
      : 'Failed to save settings';
    return res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message });
  }
};
