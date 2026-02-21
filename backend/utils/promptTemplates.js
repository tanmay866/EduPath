export const createQuizPrompt = ({ topic, difficulty, experienceLevel, questionCount }) => {
  const difficultyDescriptions = {
    beginner: 'Basic fundamental concepts, very simple and straightforward questions',
    intermediate: 'Practical application questions requiring moderate understanding',
    advanced: 'Complex scenarios, edge cases, and deep conceptual questions',
  };

  const experienceLevelContext = {
    beginner: 'Someone just starting to learn this topic with little to no prior knowledge',
    intermediate: 'Someone with 1-2 years of hands-on experience',
    advanced: 'An experienced professional with 3+ years of expertise',
  };

  return `You are an expert quiz generator. Generate EXACTLY ${questionCount} multiple-choice questions about ${topic}.

**Requirements:**
- Difficulty: ${difficulty} (${difficultyDescriptions[difficulty]})
- Target: ${experienceLevel} level (${experienceLevelContext[experienceLevel]})
- Each question: exactly 4 options, ONE correct
- Include concise explanation (max 2 sentences)
- Keep questions and options brief and clear

**CRITICAL: Return ONLY valid JSON, no markdown blocks, no extra text:**

{
  "questions": [
    {
      "question": "Question text?",
      "options": [
        { "text": "Option 1", "isCorrect": false },
        { "text": "Option 2", "isCorrect": true },
        { "text": "Option 3", "isCorrect": false },
        { "text": "Option 4", "isCorrect": false }
      ],
      "difficulty": "${difficulty}",
      "experienceLevel": "${experienceLevel}",
      "explanation": "Brief explanation",
      "tags": ["${topic}"]
    }
  ]
}

Generate ALL ${questionCount} questions in one complete JSON response. Ensure valid JSON with no trailing commas.`;
};

export const validateQuestionStructure = (questions) => {
  const errors = [];

  if (!Array.isArray(questions)) {
    errors.push('Questions must be an array');
    return errors;
  }

  questions.forEach((q, index) => {
    if (!q.question || typeof q.question !== 'string') {
      errors.push(`Question ${index + 1}: Missing or invalid question text`);
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`Question ${index + 1}: Must have exactly 4 options`);
    } else {
      const correctCount = q.options.filter(opt => opt.isCorrect).length;
      if (correctCount !== 1) {
        errors.push(`Question ${index + 1}: Must have exactly 1 correct answer (found ${correctCount})`);
      }

      q.options.forEach((opt, optIndex) => {
        if (!opt.text || typeof opt.text !== 'string') {
          errors.push(`Question ${index + 1}, Option ${optIndex + 1}: Missing text`);
        }
        if (typeof opt.isCorrect !== 'boolean') {
          errors.push(`Question ${index + 1}, Option ${optIndex + 1}: isCorrect must be boolean`);
        }
      });
    }

    if (!q.explanation || typeof q.explanation !== 'string') {
      errors.push(`Question ${index + 1}: Missing explanation`);
    }
  });

  return errors;
};