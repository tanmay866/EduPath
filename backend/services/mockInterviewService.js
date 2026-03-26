import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate interview question based on role
 * @param {string} role - The job role for the interview
 * @param {number} questionNumber - Current question number
 * @param {array} previousQuestions - Previously asked questions to avoid duplicates
 * @returns {string} - Generated interview question
 */
export async function generateInterviewQuestion(role, questionNumber = 1, previousQuestions = []) {
  const previousQuestionsText = previousQuestions.length > 0
    ? `Previously asked questions (DO NOT repeat these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`
    : '';

  const prompt = `
You are a technical interviewer conducting a mock interview.

Role: ${role}
Question Number: ${questionNumber} of 5

${previousQuestionsText}

Generate ONE unique interview question for a ${role} position.

Guidelines:
- Question ${questionNumber}/5 should progressively increase in difficulty
- Mix technical and behavioral questions
- For technical roles, include coding concepts, system design, or problem-solving
- Keep the question clear and concise
- DO NOT repeat any previously asked questions

Return ONLY the question text, nothing else.
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer with years of experience hiring for top tech companies. Generate clear, professional interview questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating interview question:', error);
    throw new Error('Failed to generate interview question');
  }
}

/**
 * Evaluate candidate's answer
 * @param {string} question - The interview question
 * @param {string} answer - Candidate's answer
 * @param {string} role - The job role
 * @returns {object} - Evaluation result with score and feedback
 */
export async function evaluateAnswer(question, answer, role) {
  const prompt = `
You are a technical interviewer evaluating a candidate's response.

Role Applied For: ${role}

Question Asked:
"${question}"

Candidate's Answer:
"${answer}"

Evaluate the answer based on:
1. Relevance to the question
2. Technical accuracy (if applicable)
3. Clarity of explanation
4. Depth of understanding
5. Communication skills

Provide your evaluation in the following JSON format ONLY (no additional text):
{
  "score": <number from 1-10>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer. Provide fair, constructive, and detailed feedback. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const content = response.choices[0].message.content.trim();

    // Try to parse JSON response
    try {
      // Extract JSON from response if wrapped in markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, return a structured response
      console.error('Failed to parse evaluation JSON:', parseError);
      return {
        score: 5,
        feedback: content,
        strengths: ['Attempted to answer the question'],
        improvements: ['Could provide more detailed response']
      };
    }
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error('Failed to evaluate answer');
  }
}

/**
 * Generate final interview summary
 * @param {array} results - Array of question-answer-evaluation objects
 * @param {string} role - The job role
 * @returns {object} - Final interview summary
 */
export async function generateInterviewSummary(results, role) {
  const interviewData = results.map((r, i) => `
Question ${i + 1}: ${r.question}
Answer: ${r.answer}
Score: ${r.evaluation.score}/10
Feedback: ${r.evaluation.feedback}
`).join('\n');

  const prompt = `
You are a technical interviewer providing a final assessment.

Role: ${role}

Interview Results:
${interviewData}

Provide a comprehensive interview summary in the following JSON format ONLY:
{
  "overallScore": <average score rounded to 1 decimal>,
  "recommendation": "<STRONG_HIRE | HIRE | MAYBE | NO_HIRE>",
  "summary": "<3-4 sentences overall assessment>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasToImprove": ["<area 1>", "<area 2>", "<area 3>"],
  "advice": "<2-3 sentences of advice for the candidate>"
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer providing final assessments. Be fair, constructive, and encouraging. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    const content = response.choices[0].message.content.trim();

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse summary JSON:', parseError);
      const totalScore = results.reduce((sum, r) => sum + (r.evaluation.score || 0), 0);
      const avgScore = (totalScore / results.length).toFixed(1);

      return {
        overallScore: parseFloat(avgScore),
        recommendation: avgScore >= 7 ? 'HIRE' : avgScore >= 5 ? 'MAYBE' : 'NO_HIRE',
        summary: content,
        topStrengths: ['Completed the interview'],
        areasToImprove: ['Continue practicing'],
        advice: 'Keep practicing and improving your interview skills.'
      };
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate interview summary');
  }
}

export default {
  generateInterviewQuestion,
  evaluateAnswer,
  generateInterviewSummary
};
