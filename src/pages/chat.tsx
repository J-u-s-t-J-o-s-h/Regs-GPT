import { withAuth } from '@/components/auth/withAuth';
import { withSubscription } from '@/components/auth/withSubscription';
import ChatInterface from '@/components/Chat/ChatInterface';

function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Army Regulations Assistant</h1>
        <ChatInterface />
      </main>
    </div>
  );
}

// Compose the HOCs - first check auth, then check subscription
export default withAuth(withSubscription(ChatPage)); 