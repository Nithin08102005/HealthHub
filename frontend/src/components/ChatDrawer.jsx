import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Send, X, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ChatDrawer = ({ isOpen, onClose, appointmentId, senderId, receiverId, receiverName }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !appointmentId) return;

    // 1. Fetch Past Messages History
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/user/get-chat-messages`,
          { appointmentId },
          { headers: { token } }
        );
        if (response.data.success) {
          setMessages(response.data.messages || []);
        } else {
          toast.error("Failed to load message history.");
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();

    // 2. Connect to Socket.io
    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    // Join the unique room for this appointment
    socket.emit("join_room", { appointmentId });

    // Listen for new messages
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, appointmentId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (socketRef.current) {
      socketRef.current.emit("send_message", {
        appointmentId,
        senderId,
        receiverId,
        messageText: inputText
      });
      setInputText("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      
      {/* Backdrop closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Chat Container Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Chat with {receiverName}</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active Connection</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Window */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const isMe = msg.sender_id === senderId;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-md border ${
                    isMe 
                      ? "bg-blue-600 border-blue-500/30 text-white rounded-tr-none" 
                      : "bg-slate-900 border-white/10 text-slate-100 rounded-tl-none"
                  }`}>
                    <p className="leading-relaxed break-words">{msg.message_text}</p>
                    <span className="text-[9px] text-white/50 block mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">No messages yet. Send a message to start the consultation chat!</p>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            required
          />
          <button 
            type="submit"
            className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatDrawer;
