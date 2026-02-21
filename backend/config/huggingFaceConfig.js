export const huggingFaceConfig = {
  apiKey: process.env.HF_TOKEN || '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',
  apiUrl: 'https://router.huggingface.co/v1/chat/completions',
  model: 'Qwen/Qwen2.5-7B-Instruct',
  generationConfig: {
    temperature: 0.7,
    max_tokens: 2000, // Increased to accommodate 10 full questions
  },
};
