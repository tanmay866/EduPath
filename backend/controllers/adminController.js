import User from '../models/userModel.js';
import QuizResult from '../models/QuizResult.js';
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
      attempts, attemptsLast30, attemptsPrev30,
      roadmaps, roadmapsLast30, roadmapsPrev30,
      skillUsage, difficultySplit, recent,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: last30 } }),
      User.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

      QuizResult.countDocuments({}),
      QuizResult.countDocuments({ createdAt: { $gte: last30 } }),
      QuizResult.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

      Roadmap.countDocuments({}),
      Roadmap.countDocuments({ createdAt: { $gte: last30 } }),
      Roadmap.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

      QuizResult.aggregate([
        { $group: { _id: '$topicId', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 6 },
      ]),

      QuizResult.aggregate([
        { $group: { _id: '$difficulty', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]),

      QuizResult.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'firstName lastName email')
        .populate('topicId', 'name')
        .lean(),
    ]);

    // Topic ids mean nothing on screen, so they are resolved to names here.
    const topicIds = skillUsage.map((row) => row._id).filter(Boolean);
    const topics = await Topic.find({ _id: { $in: topicIds } }).select('name').lean();
    const topicName = new Map(topics.map((topic) => [String(topic._id), topic.name]));

    return res.status(200).json({
      success: true,
      data: {
        stats: [
          { label: 'Users', value: users, delta: delta(usersLast30, usersPrev30) },
          { label: 'Quiz attempts', value: attempts, delta: delta(attemptsLast30, attemptsPrev30) },
          { label: 'Roadmaps', value: roadmaps, delta: delta(roadmapsLast30, roadmapsPrev30) },
          { label: 'Active learners', value: await User.countDocuments({ isActive: true }), delta: null },
        ],
        skillUsage: skillUsage.map((row) => ({
          label: topicName.get(String(row._id)) || 'Untagged',
          value: row.value,
        })),
        difficultySplit: difficultySplit.map((row) => ({
          label: row._id ? row._id[0].toUpperCase() + row._id.slice(1) : 'Untagged',
          value: row.value,
        })),
        attempts: recent.map(shapeAttempt),
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load overview' });
  }
};

const shapeAttempt = (result) => ({
  _id: String(result._id),
  userName: result.userId
    ? `${result.userId.firstName || ''} ${result.userId.lastName || ''}`.trim() || result.userId.email
    : 'Deleted user',
  skill: result.topicId?.name || 'Untagged',
  difficulty: result.difficulty
    ? result.difficulty[0].toUpperCase() + result.difficulty.slice(1)
    : 'Untagged',
  score: result.correctAnswers ?? result.score ?? 0,
  totalQuestions: result.totalQuestions ?? 0,
  createdAt: result.completedAt || result.createdAt,
});

/** GET /api/admin/attempts */
export const getAttempts = async (req, res) => {
  try {
    const results = await QuizResult.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('userId', 'firstName lastName email')
      .populate('topicId', 'name')
      .lean();

    return res.status(200).json({ success: true, data: results.map(shapeAttempt) });
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

    // Their work goes with them, the same as a self-service deletion.
    await Promise.all([
      QuizResult.deleteMany({ userId: user._id }),
      Roadmap.deleteMany({ user_id: user._id }),
    ]);

    return res.status(200).json({ success: true, message: 'User deleted' });
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
      roadmaps, roadmapsLast30, roadmapsPrev30,
      requestedRoles, difficultySplit,
    ] = await Promise.all([
      QuizResult.countDocuments({}),
      QuizResult.countDocuments({ createdAt: { $gte: last30 } }),
      QuizResult.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),
      QuizResult.countDocuments({ createdAt: { $gte: today } }),

      Roadmap.countDocuments({}),
      Roadmap.countDocuments({ createdAt: { $gte: last30 } }),
      Roadmap.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),

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
          { label: 'Generations', value: quizzes + roadmaps, delta: delta(quizzesLast30 + roadmapsLast30, quizzesPrev30 + roadmapsPrev30) },
          { label: 'Today', value: quizzesToday, delta: null },
          { label: 'Quizzes made', value: quizzes, delta: delta(quizzesLast30, quizzesPrev30) },
          { label: 'Roadmaps made', value: roadmaps, delta: delta(roadmapsLast30, roadmapsPrev30) },
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
