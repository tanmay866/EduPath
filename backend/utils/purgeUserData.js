import Roadmap from '../models/Roadmap.js';
import SkillGap from '../models/SkillGap.js';
import QuizSession from '../models/QuizSession.js';
import QuizResult from '../models/QuizResult.js';
import PracticeResult from '../models/PracticeResult.js';
import InterviewResult from '../models/InterviewResult.js';
import AtsAnalysis from '../models/AtsAnalysis.js';
import Feedback from '../models/Feedback.js';
import ProgressLog from '../models/ProgressLog.js';
import Portfolio from '../models/Portfolio.js';
import Resume from '../models/Resume.js';
import GeneratedResume from '../models/GeneratedResume.js';

/**
 * Everything one account owns, in one place.
 *
 * There were two deletion paths and they had drifted: closing your own
 * account removed all twelve of these, while an admin deleting the same
 * account removed four and left the rest orphaned — including the portfolio,
 * which went on resolving publicly for someone who no longer existed. The
 * comment on that path claimed it matched the self-service one.
 *
 * One list now, used by both, so the next collection added is added once. The
 * privacy page says deleting an account removes everything; this is the code
 * that has to keep saying it.
 */
export const OWNED_BY_USER = {
    roadmaps: Roadmap,
    skillGaps: SkillGap,
    quizSessions: QuizSession,
    quizResults: QuizResult,
    practiceResults: PracticeResult,
    interviewResults: InterviewResult,
    atsAnalyses: AtsAnalysis,
    feedback: Feedback,
    progressLogs: ProgressLog,
    portfolios: Portfolio,
    resumes: Resume,
    generatedResumes: GeneratedResume,
};

/**
 * Removes everything belonging to a user, and reports what went.
 *
 * The schemas disagree on the field name — some carry userId, others user_id
 * — so both are matched rather than assuming one.
 */
export const purgeUserData = async (userId) => {
    const ownedBy = { $or: [{ userId }, { user_id: userId }] };
    const removed = {};

    for (const [name, Model] of Object.entries(OWNED_BY_USER)) {
        const { deletedCount } = await Model.deleteMany(ownedBy);
        if (deletedCount) removed[name] = deletedCount;
    }

    return removed;
};

export default purgeUserData;
