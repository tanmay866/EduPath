import Feedback, { FEEDBACK_KINDS, FEEDBACK_STATUSES } from '../models/Feedback.js';
import { sanitiseContext, describeContext } from '../utils/feedbackContext.js';

/**
 * POST /api/feedback — a learner reports something.
 *
 * The context is filtered rather than stored as sent: it arrives from the
 * browser, and an unfiltered object would be a channel for writing whatever
 * the caller likes into the database and onto an admin's screen.
 */
export const submitFeedback = async (req, res) => {
    try {
        const message = String(req.body?.message || '').trim();
        if (message.length < 4) {
            return res.status(400).json({
                success: false,
                message: 'Tell us what went wrong — a few words is enough.',
            });
        }

        const kind = FEEDBACK_KINDS.includes(req.body?.kind) ? req.body.kind : 'general';

        const saved = await Feedback.create({
            userId: req.user._id,
            kind,
            message: message.slice(0, 2000),
            context: sanitiseContext(kind, req.body?.context),
        });

        return res.status(201).json({
            success: true,
            message: 'Thanks — this reaches a person.',
            data: { id: saved._id },
        });
    } catch (error) {
        console.error('submitFeedback error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

/**
 * GET /api/admin/feedback — the queue, newest first.
 *
 * Defaults to what has not been dealt with, because a list that opens on
 * everything ever received is one nobody works through.
 */
export const listFeedback = async (req, res) => {
    try {
        const query = {};
        if (FEEDBACK_STATUSES.includes(req.query.status)) query.status = req.query.status;
        if (FEEDBACK_KINDS.includes(req.query.kind)) query.kind = req.query.kind;

        const [rows, counts] = await Promise.all([
            Feedback.find(query)
                .sort({ createdAt: -1 })
                .limit(200)
                .populate('userId', 'firstName lastName email')
                .lean(),
            Feedback.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
        ]);

        const byStatus = Object.fromEntries(counts.map((c) => [c._id, c.n]));

        return res.status(200).json({
            success: true,
            data: {
                items: rows.map((row) => ({
                    ...row,
                    // Written once here so the list and anything built on it
                    // later cannot describe the same report differently.
                    summary: describeContext(row.kind, row.context),
                    from: row.userId
                        ? {
                            name: `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim(),
                            email: row.userId.email,
                        }
                        // Deleting an account takes its reports with it, as
                        // the privacy page says it does. This covers the gap
                        // between a delete and a list already in flight.
                        : null,
                    userId: undefined,
                })),
                counts: {
                    new: byStatus.new || 0,
                    actioned: byStatus.actioned || 0,
                    dismissed: byStatus.dismissed || 0,
                },
            },
        });
    } catch (error) {
        console.error('listFeedback error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

/** PATCH /api/admin/feedback/:id — move one through triage. */
export const updateFeedback = async (req, res) => {
    try {
        const { status, adminNote } = req.body || {};
        const update = {};

        if (status !== undefined) {
            if (!FEEDBACK_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `status must be one of: ${FEEDBACK_STATUSES.join(', ')}`,
                });
            }
            update.status = status;
            // Cleared when something is reopened, so the date always refers to
            // the state the row is actually in.
            update.resolvedAt = status === 'new' ? null : new Date();
        }

        if (adminNote !== undefined) update.adminNote = String(adminNote).slice(0, 2000);

        if (!Object.keys(update).length) {
            return res.status(400).json({ success: false, message: 'Nothing to update.' });
        }

        const updated = await Feedback.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Feedback not found.' });
        }

        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('updateFeedback error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

/** How many are waiting, for the badge on the admin nav. */
export const countNewFeedback = () => Feedback.countDocuments({ status: 'new' });
