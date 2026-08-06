import { createContext, useContext } from "react";

/**
 * The context lives here rather than beside the provider so that
 * QuizContext.jsx exports a component and nothing else — a file that mixes
 * the two loses fast refresh, and the whole quiz remounts on every edit.
 */
export const QuizContext = createContext();

export const useQuiz = () => useContext(QuizContext);
