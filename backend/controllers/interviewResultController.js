import InterviewResult from '../models/InterviewResult.js';

/**
 * Save a completed mock interview.
 * POST /api/mock-interview/results
 */
export const createInterviewResult = async (req, res) => {
  try {
    const { role, overallScore, recommendation, summary, topStrengths, areasToImprove, advice, results } = req.body;

    if (!role || typeof overallScore !== 'number' || Number.isNaN(overallScore)) {
      return res.status(400).json({ success: false, message: 'role and overallScore are required.' });
    }
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: 'results must be a non-empty array.' });
    }

    const result = await InterviewResult.create({
      userId: req.user._id,
      role,
      overallScore,
      recommendation,
      summary,
      topStrengths: Array.isArray(topStrengths) ? topStrengths : [],
      areasToImprove: Array.isArray(areasToImprove) ? areasToImprove : [],
      advice,
      results,
    });

    res.status(201).json({ success: true, data: { resultId: result._id } });
  } catch (err) {
    console.error('createInterviewResult error:', err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * List a learner's past interviews, newest first.
 * GET /api/mock-interview/results
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const results = await InterviewResult.find({ userId: req.user._id })
      .select('role overallScore recommendation createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: { results } });
  } catch (err) {
    console.error('getInterviewHistory error:', err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * One interview in full, including every question and evaluation.
 * GET /api/mock-interview/results/:resultId
 */
export const getInterviewResultById = async (req, res) => {
  try {
    const result = await InterviewResult.findById(req.params.resultId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }
    if (result.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this result.' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('getInterviewResultById error:', err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
