import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

export async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread.id;
}

export async function createMessage(threadId: string, content: string) {
  const message = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: content,
  });
  return message;
}

export async function runAssistant(threadId: string) {
  if (!ASSISTANT_ID) throw new Error('ASSISTANT_ID is not defined');
  
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
  });
  return run;
}

export async function getRunStatus(threadId: string, runId: string) {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);
  return run;
}

export async function getMessages(threadId: string) {
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages.data;
} 