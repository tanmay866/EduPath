import PracticeResult from '../models/PracticeResult.js';

const TYPES = ['aptitude', 'cs-fundamentals'];

/**
 * Save a completed aptitude/CS-fundamentals attempt.
 * POST /api/practice/results
 */
export const createPracticeResult = async (req, res) => {
  try {
    const { type, difficulty, total, correct, wrong, unanswered, percentage, timeTaken, review } = req.body;

    if (!TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${TYPES.join(', ')}` });
    }
    if (![total, correct, wrong, unanswered, percentage].every((n) => typeof n === 'number' && !Number.isNaN(n))) {
      return res.status(400).json({ success: false, message: 'total, correct, wrong, unanswered and percentage must be numbers' });
    }

    const result = await PracticeResult.create({
      userId: req.user._id,
      type,
      difficulty,
      total,
      correct,
      wrong,
      unanswered,
      percentage,
      timeTaken: timeTaken || 0,
      review: Array.isArray(review) ? review : [],
    });

    res.status(201).json({ success: true, data: { resultId: result._id } });
  } catch (err) {
    console.error('createPracticeResult error:', err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * List a learner's attempts at one practice test type, newest first.
 * GET /api/practice/results?type=aptitude
 */
export const getPracticeHistory = async (req, res) => {
  try {
    const { type } = req.query;
    if (!TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${TYPES.join(', ')}` });
    }

    const results = await PracticeResult.find({ userId: req.user._id, type })
      .select('type difficulty total correct percentage timeTaken createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: { results } });
  } catch (err) {
    console.error('getPracticeHistory error:', err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * One attempt in full, including the per-question review.
 * GET /api/practice/results/:resultId
 */
export const getPracticeResultById = async (req, res) => {
  try {
    const result = await PracticeResult.findById(req.params.resultId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }
    if (result.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this result.' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('getPracticeResultById error:', err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
