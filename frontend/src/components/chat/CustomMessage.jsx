import { useMessageContext } from "stream-chat-react";
import { format } from "date-fns";
import { FileText, Download, Check, CheckCheck, Image as ImageIcon, Video, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const CustomMessage = () => {
  const { message, isMyMessage, readBy } = useMessageContext();
  const isMine = isMyMessage();

  // Check if message is just emojis for larger size
  const isOnlyEmoji = (text) => {
    if (!text) return false;
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    return emojiRegex.test(text) && text.length < 10;
  };

  if (message.type === "system") {
    return (
      <div className="flex justify-center my-6">
        <span className="text-xs px-3 py-1 bg-base-200/50 text-base-content/60 border border-base-300/50 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  const isRead = readBy && readBy.length > 0;

  return (
    <div className={`flex gap-3 mb-3 w-full group ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar (Only show for others) */}
      {!isMine && (
        <div className="flex-shrink-0 self-end mb-1">
          <div className="relative">
            <img
              src={message.user?.image || "/avatar.png"}
              alt={message.user?.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-background shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-background" />
          </div>
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isMine ? "items-end" : "items-start"}`}>
        
        {/* Name (for others) */}
        {!isMine && (
          <span className="text-[11px] font-medium text-muted-foreground ml-1 mb-1.5">
            {message.user?.name}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`relative group/message ${
            isMine
              ? "bg-primary text-primary-content rounded-2xl rounded-br-md"
              : "bg-base-200 text-base-content rounded-2xl rounded-bl-md border border-base-300/50"
          } ${
            isOnlyEmoji(message.text) 
              ? "!bg-transparent !shadow-none !border-none !p-0" 
              : "px-4 py-2.5 shadow-sm"
          } transition-all duration-200 hover:shadow-md`}
        >
          {/* Attachments */}
          {message.attachments?.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              {message.attachments.map((att, i) => {
                // HANDLE CALL INVITE
                if (att.type === "call_invite") {
                  return (
                    <div key={i} className="card bg-base-100 border-2 border-primary/20 p-4 rounded-xl shadow-lg min-w-[200px]">
                       <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Video className="size-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base-content">Video Call</h3>
                            <p className="text-xs text-base-content/60">Tap to join</p>
                          </div>
                       </div>
                       <Link 
                        to={`/call/${att.call_id}`}
                        className="btn btn-primary btn-sm w-full gap-2"
                       >
                         <Phone className="size-4" />
                         Join Call
                       </Link>
                    </div>
                  );
                }

                if (att.type === "image" || att.image_url) {
                  return (
                    <div key={i} className="relative group/image">
                      <img
                        src={att.image_url || att.thumb_url}
                        alt="attachment"
                        className="rounded-xl max-w-full max-h-72 object-cover cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => window.open(att.asset_url || att.image_url, "_blank")}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 rounded-xl transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                        <ImageIcon className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  );
                }
                if (att.type === "file") {
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        isMine 
                          ? 'bg-primary-content/10 border-primary-content/20 hover:bg-primary-content/15' 
                          : 'bg-base-100 border-base-300 hover:bg-base-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isMine ? 'bg-primary-content/20' : 'bg-primary/10'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.title || att.fallback}</p>
                        <p className={`text-xs ${isMine ? 'text-primary-content/70' : 'opacity-60'}`}>
                          {att.file_size ? `${(att.file_size / 1024).toFixed(0)} KB` : 'File'}
                        </p>
                      </div>
                      <a 
                        href={att.asset_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-black/10 rounded-full transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Text Content */}
          {message.text && (
            <p className={`whitespace-pre-wrap break-words ${
              isOnlyEmoji(message.text) 
                ? "text-5xl leading-tight" 
                : "text-[15px] leading-relaxed"
            }`}>
              {message.text}
            </p>
          )}
          
          {/* Metadata (Time + Status) */}
          {!isOnlyEmoji(message.text) && (
            <div className={`flex items-center gap-1.5 mt-1.5 ${
              isMine ? "justify-end text-primary-content/70" : "justify-end opacity-60"
            }`}>
              <span className="text-[10px] font-medium">
                {message.created_at && format(new Date(message.created_at), "HH:mm")}
              </span>
              {isMine && (
                <span className="flex items-center">
                  {isRead ? (
                    <CheckCheck className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reaction Preview (if any) */}
        {message.reaction_counts && Object.keys(message.reaction_counts).length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMine ? 'mr-2' : 'ml-2'}`}>
            {Object.entries(message.reaction_counts).map(([emoji, count]) => (
              <span 
                key={emoji} 
                className="text-xs px-2 py-0.5 bg-base-200 hover:bg-base-300 rounded-full"
              >
                {emoji} {count > 1 && count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMessage;