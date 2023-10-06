import type { Actions } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';


export const actions = {
  summarize: async ({ request }: { request: Request }): Promise<Actions['summarize']['response']> => {

    // Initialize the connection to OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Load and store the document
    const form = await request.formData();
    const document = form.get('document') as string;

    // Generate the summary
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a document summarizer. Your summaries are concise, accurate, and well-written. You must keep them short and sweet. You are very good at your job.' },
        { role: 'user', content: 'Please summarize this document:' },
        { role: 'user', content: document },
      ],
      model: 'gpt-3.5-turbo',
    });
    const summary = chatCompletion.choices[0].message.content;

    return { summary };
  }
} satisfies Actions;