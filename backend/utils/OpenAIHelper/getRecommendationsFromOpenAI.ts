import openai from '../../config/openAIConfig';

export async function getRecommendationsFromOpenAI(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000,
    temperature: 0.7,
  });

  const content = completion.choices[0].message?.content;
  return content;
}
