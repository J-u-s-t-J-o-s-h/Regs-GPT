interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string[];
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={`p-4 rounded-lg max-w-[80%] ${
        role === 'user' 
          ? 'ml-auto bg-primary text-white' 
          : 'bg-gray-700 text-white'
      }`}
    >
      {content.map((text, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {text}
        </p>
      ))}
    </div>
  );
} 