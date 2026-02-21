import axios from 'axios';
import { huggingFaceConfig } from '../config/huggingFaceConfig.js';
import { createQuizPrompt, validateQuestionStructure } from '../utils/promptTemplates.js';

class HuggingFaceService {
    constructor() {
        this.apiKey = huggingFaceConfig.apiKey;
        this.apiUrl = huggingFaceConfig.apiUrl;
        this.model = huggingFaceConfig.model;
        this.generationConfig = huggingFaceConfig.generationConfig;

        if (!this.apiKey) {
            throw new Error('HF_TOKEN is not configured in environment variables');
        }
    }

    /**
     * Generate quiz questions using Hugging Face API
     * @param {Object} params - Quiz generation parameters
     * @param {string} params.topic - Topic name (e.g., "React", "Node.js")
     * @param {string} params.difficulty - beginner | intermediate | advanced
     * @param {string} params.experienceLevel - beginner | intermediate | advanced
     * @param {number} params.questionCount - Number of questions to generate
     * @returns {Promise<Array>} Array of generated questions
     */
    async generateQuizQuestions({ topic, difficulty, experienceLevel, questionCount = 10 }) {
        try {
            console.log('🚀 Generating quiz questions with Hugging Face API...');
            console.log(`📚 Topic: ${topic}`);
            console.log(`📊 Difficulty: ${difficulty}`);
            console.log(`👤 Experience: ${experienceLevel}`);
            console.log(`🔢 Count: ${questionCount}`);

            // Create the prompt
            const prompt = createQuizPrompt({ topic, difficulty, experienceLevel, questionCount });

            // Generate content with retry logic
            const questions = await this.generateWithRetry(prompt, 3);

            // Validate question structure
            const validationErrors = validateQuestionStructure(questions);
            if (validationErrors.length > 0) {
                console.error('❌ Validation errors:', validationErrors);
                throw new Error(`Generated questions failed validation: ${validationErrors.join(', ')}`);
            }

            console.log(`✅ Successfully generated ${questions.length} valid questions`);
            return questions;

        } catch (error) {
            console.error('❌ Error generating quiz questions:', error);
            throw new Error(`Failed to generate quiz questions: ${error.message}`);
        }
    }

    /**
     * Generate content with retry logic using Hugging Face API
     */
    async generateWithRetry(prompt, maxRetries = 3) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${maxRetries}`);

                const response = await axios.post(
                    this.apiUrl,
                    {
                        model: this.model,
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: this.generationConfig.temperature,
                        max_tokens: this.generationConfig.max_tokens
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.data || !response.data.choices || !response.data.choices[0]) {
                    throw new Error('Invalid response from Hugging Face API');
                }

                const content = response.data.choices[0].message.content;
                console.log('📥 Received response from Hugging Face');

                // Parse JSON response
                const questions = this.parseResponse(content);
                return questions;

            } catch (error) {
                lastError = error;
                console.error(`❌ Attempt ${attempt} failed:`, error.response?.data || error.message);

                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.log(`⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
    }

    /**
     * Parse Hugging Face API response and extract questions
     */
    parseResponse(responseText) {
        try {
            // Remove markdown code blocks if present
            let cleanedText = responseText.trim();

            // Remove ```json and ``` markers
            cleanedText = cleanedText.replace(/^```json?\s*/i, '');
            cleanedText = cleanedText.replace(/```\s*$/, '');

            // Remove any leading/trailing whitespace
            cleanedText = cleanedText.trim();

            // Try to fix common JSON truncation issues
            cleanedText = this.attemptJsonRepair(cleanedText);

            // Parse JSON
            const parsed = JSON.parse(cleanedText);

            // Extract questions array
            const questions = parsed.questions || parsed;

            if (!Array.isArray(questions)) {
                throw new Error('Response does not contain a valid questions array');
            }

            return questions;

        } catch (error) {
            console.error('❌ JSON Parse Error:', error.message);
            console.error('📄 Response text:', responseText.substring(0, 500));
            throw new Error(`Failed to parse Hugging Face response: ${error.message}`);
        }
    }

    /**
     * Attempt to repair truncated JSON by closing unclosed structures
     */
    attemptJsonRepair(jsonString) {
        // Check if JSON is already valid
        try {
            JSON.parse(jsonString);
            return jsonString; // Already valid, return as is
        } catch (e) {
            // JSON is invalid, attempt repair
        }

        let repaired = jsonString;

        // Count open/close brackets and braces
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/]/g) || []).length;
        const openQuotes = (repaired.match(/"/g) || []).length;

        // If we have an odd number of quotes, the string was truncated mid-string
        if (openQuotes % 2 !== 0) {
            // Find the last complete object by finding the last complete question
            const lastCompleteMatch = repaired.lastIndexOf('"explanation"');
            if (lastCompleteMatch !== -1) {
                // Find the closing brace of this explanation
                let braceCount = 0;
                let foundStart = false;
                let cutoffPoint = lastCompleteMatch;

                for (let i = lastCompleteMatch; i < repaired.length; i++) {
                    if (repaired[i] === '{') {
                        foundStart = true;
                        braceCount++;
                    } else if (repaired[i] === '}') {
                        braceCount--;
                        if (foundStart && braceCount === 0) {
                            cutoffPoint = i + 1;
                            break;
                        }
                    }
                }

                // Cut off incomplete content after last complete question
                repaired = repaired.substring(0, cutoffPoint);
            } else {
                // Remove the incomplete string
                repaired = repaired.substring(0, repaired.lastIndexOf('"'));
            }
        }

        // Close any unclosed arrays
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
            repaired += ']';
        }

        // Close any unclosed objects
        for (let i = 0; i < openBraces - closeBraces; i++) {
            repaired += '}';
        }

        console.log('🔧 Attempted JSON repair');
        return repaired;
    }

    /**
     * Test the Hugging Face API connection
     */
    async testConnection() {
        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: 'Say "Hello, EduPath!" if you can read this.'
                        }
                    ],
                    max_tokens: 50
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const message = response.data.choices[0].message.content;
            console.log('✅ Hugging Face API test successful:', message);
            return true;
        } catch (error) {
            console.error('❌ Hugging Face API test failed:', error.response?.data || error.message);
            return false;
        }
    }
}

// Export singleton instance
export default new HuggingFaceService();
