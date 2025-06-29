import { Message } from "@/types/discord";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        {message.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.avatar}
            alt={`${message.author}'s avatar`}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                message.author
              )}&background=6366f1&color=fff`;
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
            {message.author.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 truncate">
            {message.author}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <p className="text-gray-700 break-words whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
}
