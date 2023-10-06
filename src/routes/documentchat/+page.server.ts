import type { Actions } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';


const documentChunks: { [key: string]: string } = {};


async function chunkDocument(document: string, chunkSize: number = 1000): Promise<string[]> {
  const chunks: string[] = [];

  // Split the document into chunks of chunkSize characters
  let chunk = '';
  for (const word of document.split(' ')) {
    if (chunk.length + word.length > chunkSize) {
      chunks.push(chunk.slice(0, -1));  // Remove the trailing space
      chunk = '';
    }
    chunk += word + ' ';
  }
  chunks.push(chunk);  // Add the last chunk

  return chunks;
}


export const actions = {
  processDocument: async ({ request }: { request: Request }): Promise<Actions> => {

    // Initialize the connection to OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Load, store, and chunk the document
    const form = await request.formData();
    const document = form.get('document') as string;
    const chunks = await chunkDocument(document);

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