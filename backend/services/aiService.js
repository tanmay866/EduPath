import axios from 'axios';

/**
 * AI Service Integration
 * Connects Node.js backend to Python FastAPI AI service
 *
 * Skill assessment only. This also carried checkHealth, parseResume (the
 * FastAPI/Surya OCR path) and matchSkills, none of which had a caller left in
 * any of the three services — resume parsing moved to Groq in
 * services/groqResumeParser.js, and the warm-up ping in services/aiWarmup.js
 * hits the service root directly. They were removed rather than kept as an
 * alternative, because an unused second implementation is the one that goes
 * stale without anyone noticing.
 *
 * The FastAPI /ai/parse-resume and /ai/match-skills endpoints still exist and
 * are unchanged; this file simply no longer speaks to them.
 *
 * Roadmap generation and job analysis do not go through here at all — they
 * call the service directly from controllers/roadmapController.js, on a much
 * longer timeout. See the note on this.timeout below for why the two differ.
 */
class AIService {
    constructor() {
        // AI Service URL (Python FastAPI)
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

        /**
         * Deliberately not the 180s that roadmap generation carries.
         *
         * Those calls got a long timeout because a cold start on Render's
         * free tier measured 162 seconds and there is no useful answer
         * without the service — see controllers/roadmapController.js and
         * services/aiWarmup.js. The calls made through here are the opposite
         * case: assessSkill enriches a quiz result that has already been
         * scored and saved, it has a real fallback below, and a learner is
         * sitting on the results page waiting for it. Making them wait three
         * minutes for something optional would be a worse bug than the one
         * the long timeout fixed.
         *
         * So this stays bounded on purpose. The warm-up ping is what keeps a
         * cold start from being met here at all; when one is met anyway the
         * learner gets the basic analysis a few seconds later instead of the
         * generated one.
         */
        this.timeout = parseInt(process.env.AI_SERVICE_TIMEOUT || '30000');
    }

    /**
     * Assess skill based on quiz results
     * Calls: POST /api/ai/assess-skill
     *
     * @param {Object} assessmentData - Quiz result data
     * @returns {Promise<Object>} AI-generated analysis
     */
    async assessSkill(assessmentData) {
        try {
            const {
                userId,
                skillName,
                normalizedScore,
                accuracy,
                difficultyBreakdown,
                answers,
                careerPath,
                userLevel
            } = assessmentData;

            console.log(`🤖 Requesting AI assessment for: ${skillName}`);

            const requestBody = {
                user_id: userId,
                skill_name: skillName,
                normalized_score: normalizedScore,
                accuracy: accuracy,
                difficulty_breakdown: difficultyBreakdown,
                answers: answers,
                career_path: careerPath || 'MERN',
                user_level: userLevel || 'Intermediate'
            };

            const response = await axios.post(
                `${this.baseUrl}/api/ai/assess-skill`,
                requestBody,
                {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`✅ AI assessment completed in ${response.data.processing_time}s`);

            return {
                success: true,
                analysis: response.data.analysis,
                processingTime: response.data.processing_time
            };

        } catch (error) {
            console.error('❌ AI assessment failed:', error.response?.data || error.message);

            // Return graceful fallback
            return {
                success: false,
                error: error.response?.data?.detail || error.message,
                fallback: this._generateBasicAnalysis(assessmentData)
            };
        }
    }

    /**
     * Generate basic fallback analysis if AI service fails
     * @private
     */
    _generateBasicAnalysis(assessmentData) {
        const { normalizedScore, accuracy } = assessmentData;

        let performance = 'Needs Improvement';
        let recommendations = ['Keep practicing regularly', 'Review fundamental concepts'];

        if (accuracy >= 85) {
            performance = 'Excellent';
            recommendations = ['Master advanced topics', 'Share knowledge with others'];
        } else if (accuracy >= 70) {
            performance = 'Good';
            recommendations = ['Focus on advanced concepts', 'Build practical projects'];
        } else if (accuracy >= 50) {
            performance = 'Average';
            recommendations = ['Strengthen fundamentals', 'Practice more exercises'];
        }

        return {
            skill_strength: normalizedScore,
            weak_areas: [],
            strengths: [performance],
            recommendations,
            next_steps: ['Continue learning', 'Take more quizzes'],
            consistency_score: 0,
            progression_readiness: 'Continue building skills',
            estimated_time_to_next_level: '2-3 months'
        };
    }
}

// Export singleton instance
export default new AIService();
