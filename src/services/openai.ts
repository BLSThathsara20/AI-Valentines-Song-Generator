import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const MAX_LYRICS_LENGTH = 900;

export async function generateValentineLyrics(
  idea: string,
  type: 'romantic' | 'friendship' | 'nature' | 'inspiration'
): Promise<string> {
  try {
    const prompt = `Write concise song lyrics based on this idea: "${idea}"
      Style: ${type}
      Strict Requirements:
      - Must be under ${MAX_LYRICS_LENGTH} characters total
      - Include exactly two verses and two choruses
      - Keep it family-friendly and Valentine's themed
      - Make it emotional and meaningful
      - Focus on quality over quantity
      Format:
      [Verse]
      (4 lines max)

      [Chorus]
      (4 lines max)

      [Verse]
      (4 lines max)

      [Chorus]
      (4 lines max)`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 900,
      presence_penalty: 0.6,
      frequency_penalty: 0.2,
    });

    let lyrics = completion.choices[0].message.content;
    if (!lyrics) throw new Error('No lyrics generated');

    if (lyrics.length > MAX_LYRICS_LENGTH) {
      lyrics = lyrics.slice(0, MAX_LYRICS_LENGTH);
      const lastNewline = lyrics.lastIndexOf('\n');
      if (lastNewline > 0) {
        lyrics = lyrics.slice(0, lastNewline);
      }
    }

    return lyrics;
  } catch (error) {
    console.error('Error generating lyrics:', error);
    throw new Error('Failed to generate lyrics. Please try again.');
  }
} 