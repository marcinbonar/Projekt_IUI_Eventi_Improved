export function parseOpenAIResponse(content: string) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('Błąd parsowania odpowiedzi OpenAI');
  }
}
