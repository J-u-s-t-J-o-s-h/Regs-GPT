import { NextApiRequest, NextApiResponse } from 'next';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  createThread, 
  createMessage, 
  runAssistant, 
  getRunStatus, 
  getMessages 
} from '@/lib/openai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const { uid } = decodedToken;

    // Check subscription status
    const subscriptionRef = doc(db, 'users', uid, 'subscriptions', 'status');
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists() || subscriptionDoc.data().status !== 'active') {
      return res.status(403).json({ error: 'Premium subscription required' });
    }

    const { message, threadId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create a new thread if threadId is not provided
    const currentThreadId = threadId || await createThread();

    // Add the user's message to the thread
    await createMessage(currentThreadId, message);

    // Run the assistant
    const run = await runAssistant(currentThreadId);

    // Poll for completion
    let runStatus = await getRunStatus(currentThreadId, run.id);
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await getRunStatus(currentThreadId, run.id);
    }

    if (runStatus.status === 'completed') {
      // Get the messages, including the assistant's response
      const messages = await getMessages(currentThreadId);
      
      return res.status(200).json({
        threadId: currentThreadId,
        messages: messages,
      });
    } else {
      return res.status(500).json({
        error: `Run ended with status: ${runStatus.status}`,
      });
    }
  } catch (error) {
    console.error('Error in assistant chat:', error);
    return res.status(500).json({
      error: 'An error occurred while processing your request',
    });
  }
} 