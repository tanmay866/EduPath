export const staticAssessment = {
  assessmentId: "static-quiz-001",
  title: "Frontend Development Assessment",
  skill: "React.js",
  duration: 30,
  totalQuestions: 10,
  questions: [
    {
      _id: "q1",
      question: "What is React?",
      options: [
        "A JavaScript library for building user interfaces",
        "A server-side framework",
        "A database management system",
        "A CSS preprocessor"
      ],
      correctAnswer: 0
    },
    {
      _id: "q2",
      question: "Which hook is used to manage state in functional components?",
      options: [
        "useEffect",
        "useState",
        "useContext",
        "useReducer"
      ],
      correctAnswer: 1
    },
    {
      _id: "q3",
      question: "What does JSX stand for?",
      options: [
        "JavaScript XML",
        "Java Syntax Extension",
        "JavaScript Extension",
        "Java XML"
      ],
      correctAnswer: 0
    },
    {
      _id: "q4",
      question: "Which method is used to create components in React?",
      options: [
        "React.createComponent()",
        "React.component()",
        "function or class",
        "React.makeComponent()"
      ],
      correctAnswer: 2
    },
    {
      _id: "q5",
      question: "What is the virtual DOM?",
      options: [
        "A copy of the real DOM kept in memory",
        "A new browser API",
        "A CSS framework",
        "A database structure"
      ],
      correctAnswer: 0
    },
    {
      _id: "q6",
      question: "Which hook is used for side effects in React?",
      options: [
        "useState",
        "useEffect",
        "useCallback",
        "useMemo"
      ],
      correctAnswer: 1
    },
    {
      _id: "q7",
      question: "What is prop drilling in React?",
      options: [
        "Passing data through multiple layers of components",
        "Creating new props",
        "Deleting props",
        "Updating props automatically"
      ],
      correctAnswer: 0
    },
    {
      _id: "q8",
      question: "Which of the following is true about React keys?",
      options: [
        "Keys should be unique among siblings",
        "Keys can be random numbers",
        "Keys are not important",
        "Keys should always be index"
      ],
      correctAnswer: 0
    },
    {
      _id: "q9",
      question: "What is the purpose of useContext hook?",
      options: [
        "To manage state",
        "To access React Context",
        "To create side effects",
        "To optimize performance"
      ],
      correctAnswer: 1
    },
    {
      _id: "q10",
      question: "Which lifecycle method is equivalent to useEffect with empty dependency array?",
      options: [
        "componentDidUpdate",
        "componentWillMount",
        "componentDidMount",
        "componentWillUnmount"
      ],
      correctAnswer: 2
    }
  ]
};
