import axios from 'axios';

// CS-related categories only
const CS_CATEGORIES = ['DevOps', 'Programming'];

// CS-related tags for validation
const CS_TAGS = ['docker', 'containers', 'devops', 'python', 'data-structures', 'programming', 'code', 'algorithms', 'kubernetes', 'ci-cd', 'git', 'linux', 'bash', 'javascript', 'java', 'sql', 'database', 'api', 'backend', 'frontend', 'web'];

/**
 * Check if a question is CS-related
 */
const isCSRelated = (question) => {
  // Check category
  if (CS_CATEGORIES.includes(question.category)) {
    return true;
  }

  // Check tags
  if (question.tags && Array.isArray(question.tags)) {
    return question.tags.some(tag =>
      CS_TAGS.includes(tag.toLowerCase())
    );
  }

  return false;
};

/**
 * Get CS Fundamentals questions from QuizAPI (Only CS-related)
 * GET /api/cs/questions
 */
export const getCSQuestions = async (req, res) => {
  try {
    const { difficulty = '', limit = 5 } = req.query;

    // Map difficulty to uppercase format
    const difficultyMap = {
      'easy': 'EASY',
      'medium': 'MEDIUM',
      'hard': 'HARD'
    };

    const apiDifficulty = difficultyMap[difficulty.toLowerCase()] || '';

    console.log(`\n🎯 Fetching CS Fundamentals Questions`);
    console.log(`📊 Difficulty: ${apiDifficulty || 'All'}`);
    console.log(`🔢 Required: ${limit} questions`);

    const apiKey = process.env.QUIZ_API_KEY;
    if (!apiKey) {
      console.error('❌ QuizAPI key not configured');
      return res.status(500).json({
        success: false,
        error: 'QuizAPI key not configured'
      });
    }

    let allCSQuestions = [];

    // Fetch from each CS category separately to ensure we get CS questions
    for (const category of CS_CATEGORIES) {
      const randomOffset = Math.floor(Math.random() * 15);
      let url = `https://quizapi.io/api/v1/questions?api_key=${apiKey}&limit=20&offset=${randomOffset}&category=${category}`;

      if (apiDifficulty) {
        url += `&difficulty=${apiDifficulty}`;
      }

      try {
        console.log(`🔗 Fetching ${category} questions...`);
        const response = await axios.get(url);
        const apiResponse = response.data;

        if (apiResponse.success && Array.isArray(apiResponse.data)) {
          // Filter to ensure only CS-related questions
          const csQuestions = apiResponse.data.filter(isCSRelated);
          console.log(`   ✓ Got ${csQuestions.length} ${category} questions`);
          allCSQuestions = [...allCSQuestions, ...csQuestions];
        }
      } catch (err) {
        console.log(`⚠️ Failed to fetch ${category}: ${err.message}`);
      }
    }

    // Also try fetching by CS-specific tags
    const csTags = ['docker', 'python', 'devops'];
    for (const tag of csTags) {
      try {
        const tagUrl = `https://quizapi.io/api/v1/questions?api_key=${apiKey}&limit=10&tags=${tag}`;
        const tagResponse = await axios.get(tagUrl);
        if (tagResponse.data.success && Array.isArray(tagResponse.data.data)) {
          const tagQuestions = tagResponse.data.data.filter(isCSRelated);
          allCSQuestions = [...allCSQuestions, ...tagQuestions];
        }
      } catch (err) {
        // Ignore tag fetch errors
      }
    }

    if (allCSQuestions.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No CS questions available'
      });
    }

    // Remove duplicates based on question id
    const uniqueQuestions = allCSQuestions.filter((q, index, self) =>
      index === self.findIndex(t => t.id === q.id)
    );

    console.log(`📚 Total unique CS questions: ${uniqueQuestions.length}`);

    // Shuffle and select required number of questions
    const shuffled = uniqueQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, parseInt(limit));

    // Transform the response to match frontend format
    const questions = selectedQuestions.map((q, index) => {
      const options = [];

      if (q.answers && Array.isArray(q.answers)) {
        q.answers.forEach((answer) => {
          if (answer.text) {
            options.push({ text: answer.text, isCorrect: answer.isCorrect === true });
          }
        });
      }

      // Shuffle the options
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
      const correctAnswerIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

      return {
        id: q.id || index,
        question: q.text || q.question || 'Question not available',
        options: shuffledOptions.map(opt => opt.text),
        correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
        category: q.category || 'CS',
        difficulty: q.difficulty || 'MEDIUM',
        explanation: q.explanation || '',
        tags: Array.isArray(q.tags) ? q.tags : []
      };
    });

    console.log(`✅ Returning ${questions.length} CS questions`);

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });

  } catch (error) {
    console.error('❌ Error fetching CS questions:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions',
      message: error.message
    });
  }
};

/**
 * Get categories info
 * GET /api/cs/categories
 */
export const getCategories = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        categories: CS_CATEGORIES,
        description: 'CS Fundamentals covers DevOps (Docker, CI/CD, Kubernetes) and Programming (Python, Data Structures, Algorithms)'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};
