import type { Actions } from './$types';
import { cosineSimilarity } from '$lib/vector';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';


const K = 5;
let embeddingChunks: { embedding: number[], chunk: string }[] = [];


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
  chat: async ({ request }: { request: Request }): Promise<Actions['chat']['response']> => {
    // Initialize the connection to OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Load and store the message
    const form = await request.formData();
    const message = form.get('message') as string;

    // Embed the message
    const embeddingResponse = await openai.embeddings.create({
      input: [message],
      model: 'text-embedding-ada-002',
    });
    const embedding: number[] = embeddingResponse.data[0].embedding;

    // Compute similarity between message and currently stored chunks
    const similarities: { similarity: number, chunk: string }[] = [];
    for (const embeddingChunk of embeddingChunks) {
      similarities.push({
        similarity: await cosineSimilarity(embedding, embeddingChunk.embedding),
        chunk: embeddingChunk.chunk,
      });
    }

    // Find the k most similar chunks
    similarities.sort((a, b) => b.similarity - a.similarity);
    const mostSimilarChunks = similarities.slice(0, K);

    // Create messages to inject into the chat
    const informationMessages: { role: 'user', content: string }[] = [];
    if (mostSimilarChunks.length > 0) {
      informationMessages.push({ role: 'user', content: 'I have a question, here is the relevant information to help answer my query:' });
      for (const chunk of mostSimilarChunks) {
        informationMessages.push({ role: 'user', content: chunk.chunk });
      }
    }

    // Generate the response
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an intelligent question-answering chatbot. You are very good at answering questions using the information you are given. You synthesize information relative to the question and give a response that is well-formulated, concise, and accurate.' },
        ...informationMessages,
        { role: 'user', content: 'Here is my question:' },
        { role: 'user', content: message },
      ],
      model: 'gpt-3.5-turbo',
    });
    const response = chatCompletion.choices[0].message.content;

    return { response };
  },

  processDocument: async ({ request }: { request: Request }): Promise<Actions> => {

    // Initialize the connection to OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Load, store, and chunk the document
    const form = await request.formData();
    const document = form.get('document') as string;
    const chunks: string[] = await chunkDocument(document);

    // Generate the embeddings
    const embeddingResponse = await openai.embeddings.create({
      input: chunks,
      model: 'text-embedding-ada-002',
    });
    
    // Store the embeddings and chunks
    embeddingChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      embeddingChunks.push({
        embedding: embeddingResponse.data[i].embedding,
        chunk: chunks[i],
      });
    }

    return {};
  }
} satisfies Actions;