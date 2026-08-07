import mongoose from 'mongoose';

/**
 * One ATS run: a resume read against one job posting.
 *
 * Every other assessment here is kept — quiz attempts, mock interviews,
 * practice sessions, skill gaps, roadmaps — and this was the only one that
 * was not. The result lived in React state and nowhere else, so uploading a
 * resume, pasting a posting and waiting on a Python process bought something
 * a single refresh threw away. The download button went with it, since the
 * report is generated from the result the page is holding.
 *
 * What is stored is the analysis, not the inputs. The resume text is the
 * most personal thing this product touches and it is not needed to show a
 * result again — the file's name and a short excerpt of the posting are
 * enough to tell one run from another.
 */
const dimensionSchema = new mongoose.Schema(
    {
        key: { type: String },
        label: { type: String },
        score: { type: Number },
    },
    { _id: false }
);

const fixSchema = new mongoose.Schema(
    {
        id: { type: String },
        title: { type: String },
        detail: { type: String },
        points: { type: Number },
    },
    { _id: false }
);

const atsAnalysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        score: { type: Number, required: true },
        status: { type: String },
        similarity: { type: Number },
        method: { type: String },
        message: { type: String },
        dimensions: [dimensionSchema],
        fixes: [fixSchema],
        // Free-shaped counts straight from the scorer. Kept loose on purpose:
        // the scorer owns what it measures, and a schema listing every field
        // would be a second place to update whenever it learns something new.
        details: { type: mongoose.Schema.Types.Mixed, default: {} },

        // Enough to tell two runs apart without keeping either document.
        resumeName: { type: String, default: '' },
        jobExcerpt: { type: String, default: '' },

        // Which fixes the learner has ticked off. It was page state and so
        // did not survive a refresh either, and a checklist that forgets what
        // you checked is worse than no checklist.
        appliedFixes: [{ type: String }],
    },
    { timestamps: true }
);

atsAnalysisSchema.index({ userId: 1, createdAt: -1 });

const AtsAnalysis = mongoose.model('AtsAnalysis', atsAnalysisSchema);

export default AtsAnalysis;
