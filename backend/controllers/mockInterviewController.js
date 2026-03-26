import {
  generateInterviewQuestion,
  evaluateAnswer,
  generateInterviewSummary
} from '../services/mockInterviewService.js';

/**
 * Generate a new interview question
 * POST /api/mock-interview/question
 */
export const getQuestion = async (req, res) => {
  try {
    const { role, questionNumber, previousQuestions } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    console.log(`\n🎤 Generating interview question`);
    console.log(`   Role: ${role}`);
    console.log(`   Question #: ${questionNumber || 1}`);

    const question = await generateInterviewQuestion(
      role,
      questionNumber || 1,
      previousQuestions || []
    );

    console.log(`✅ Question generated successfully`);

    res.json({
      success: true,
      data: {
        question,
        questionNumber: questionNumber || 1
      }
    });

  } catch (error) {
    console.error('❌ Error generating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate interview question',
      message: error.message
    });
  }
};

/**
 * Evaluate candidate's answer
 * POST /api/mock-interview/evaluate
 */
export const evaluate = async (req, res) => {
  try {
    const { question, answer, role } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Question and answer are required'
      });
    }

    console.log(`\n📝 Evaluating answer`);
    console.log(`   Question: ${question.substring(0, 50)}...`);
    console.log(`   Answer length: ${answer.length} chars`);

    const evaluation = await evaluateAnswer(question, answer, role || 'Software Developer');

    console.log(`✅ Evaluation complete - Score: ${evaluation.score}/10`);

    res.json({
      success: true,
      data: evaluation
    });

  } catch (error) {
    console.error('❌ Error evaluating answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate answer',
      message: error.message
    });
  }
};

/**
 * Generate final interview summary
 * POST /api/mock-interview/summary
 */
export const getSummary = async (req, res) => {
  try {
    const { results, role } = req.body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Interview results are required'
      });
    }

    console.log(`\n📊 Generating interview summary`);
    console.log(`   Role: ${role}`);
    console.log(`   Questions answered: ${results.length}`);

    const summary = await generateInterviewSummary(results, role || 'Software Developer');

    console.log(`✅ Summary generated - Overall Score: ${summary.overallScore}/10`);

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate interview summary',
      message: error.message
    });
  }
};

/**
 * Get available interview roles
 * GET /api/mock-interview/roles
 */
export const getRoles = async (req, res) => {
  try {
    const roles = [
      {
        id: 'frontend',
        name: 'Frontend Developer',
        description: 'React, JavaScript, CSS, HTML, UI/UX',
        icon: '🎨'
      },
      {
        id: 'backend',
        name: 'Backend Developer',
        description: 'Node.js, APIs, Databases, Server-side logic',
        icon: '⚙️'
      },
      {
        id: 'fullstack',
        name: 'Full Stack Developer',
        description: 'End-to-end development, Frontend & Backend',
        icon: '🔄'
      },
      {
        id: 'mern',
        name: 'MERN Stack Developer',
        description: 'MongoDB, Express, React, Node.js',
        icon: '🚀'
      },
      {
        id: 'devops',
        name: 'DevOps Engineer',
        description: 'CI/CD, Docker, Kubernetes, Cloud',
        icon: '☁️'
      },
      {
        id: 'data',
        name: 'Data Scientist',
        description: 'Python, ML, Data Analysis, Statistics',
        icon: '📊'
      }
    ];

    res.json({
      success: true,
      data: roles
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    });
  }
};

export default {
  getQuestion,
  evaluate,
  getSummary,
  getRoles
};
