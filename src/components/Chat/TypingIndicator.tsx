export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-700 text-white rounded-lg max-w-[80%]">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
      </div>
      <span className="text-sm">AI Assistant is typing...</span>
    </div>
  );
} 