import axios from 'axios';

/**
 * AI Service Integration
 * Connects Node.js backend to Python FastAPI AI service
 * Handles skill assessment, resume parsing, and skill matching
 */
class AIService {
    constructor() {
        // AI Service URL (Python FastAPI)
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        this.timeout = parseInt(process.env.AI_SERVICE_TIMEOUT || '30000'); // 30 seconds
    }

    /**
     * Test AI service health and availability
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, {
                timeout: 5000
            });
            return {
                available: true,
                status: response.data
            };
        } catch (error) {
            console.error('⚠️  AI service health check failed:', error.message);
            return {
                available: false,
                error: error.message
            };
        }
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
     * Parse resume using Surya OCR
     * Calls: POST /ai/parse-resume
     *
     * @param {File} fileBuffer - Resume file buffer
     * @param {string} filename - Original filename
     * @returns {Promise<Object>} Parsed resume data
     */
    async parseResume(fileBuffer, filename) {
        try {
            console.log(`📄 Sending resume to AI service: ${filename}`);

            const formData = new FormData();
            formData.append('file', fileBuffer, filename);

            const response = await axios.post(
                `${this.baseUrl}/ai/parse-resume`,
                formData,
                {
                    timeout: 60000, // 60 seconds for OCR
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('✅ Resume parsed successfully');
            return response.data;

        } catch (error) {
            console.error('❌ Resume parsing failed:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || error.message);
        }
    }

    /**
     * Match extracted skills with database skills
     * Calls: POST /ai/match-skills
     *
     * @param {Array<string>} extractedSkills - Skills from resume
     * @param {Array<string>} databaseSkills - Skills from database
     * @returns {Promise<Object>} Matched and unmatched skills
     */
    async matchSkills(extractedSkills, databaseSkills) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/ai/match-skills`,
                {
                    extracted_skills: extractedSkills,
                    database_skills: databaseSkills
                },
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;

        } catch (error) {
            console.error('❌ Skill matching failed:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || error.message);
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
