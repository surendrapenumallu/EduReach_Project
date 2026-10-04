import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Minus, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendMessage } from "../services/chat.service";
import toast from "react-hot-toast";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

const quickQuestions = [
  "How many classes can I miss?",
  "What is my overall CGPA?",
  "When is my next exam?",
  "What is my placement match score?",
];

export default function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hi ${user?.name?.split(" ")[0] || "there"}! I'm EduReach Agentic AI Counselor. Ask me about your attendance, bunk safety, CGPA, exams, or placement matches!`,
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`[\]()]/g, "").slice(0, 200);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS Error:", err);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition is not supported in your browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        toast.success("Listening... Speak your question.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Could not hear voice properly.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || sending) return;

    const userMsg: Message = { id: Date.now(), text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const data = await sendMessage(messageText);
      const botMsg: Message = { id: Date.now() + 1, text: data.message, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);
      speakText(data.message);
    } catch {
      const errorMsg: Message = { id: Date.now() + 1, text: "Sorry, something went wrong. Please try again.", sender: "bot" };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon to-maroon-dark px-4 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm font-heading">EduReach Agentic AI</h3>
              <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 text-[9px] font-extrabold rounded">VOICE</span>
            </div>
            <p className="text-white/70 text-[11px]">Tool Calling + Speech Active</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title={ttsEnabled ? "Disable Voice Reader" : "Enable Voice Reader"}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/80">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "bot" && (
              <div className="w-7 h-7 bg-maroon rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-amber-300" />
              </div>
            )}
            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-maroon text-white rounded-br-sm shadow-md"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm font-medium"
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === "user" && (
              <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-gray-700" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 bg-maroon rounded-full flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="bg-white border border-gray-200 px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-maroon rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-maroon rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-maroon rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 mb-1.5">Suggested Agentic Questions:</p>
          <div className="flex flex-wrap gap-1">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-[11px] px-2.5 py-1 bg-white border border-maroon/20 text-maroon font-semibold rounded-full hover:bg-maroon hover:text-white transition-all shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice & Input Controls */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          {/* Priority 10: Microphone Speech-to-Text Button */}
          <button
            onClick={startVoiceInput}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500 text-white animate-ping"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            }`}
            title="Speak your question"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-maroon" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask EduReach Agentic AI..."}
            disabled={sending}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-maroon text-xs sm:text-sm disabled:opacity-50 transition-colors"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            className="w-9 h-9 bg-maroon text-white rounded-xl flex items-center justify-center hover:bg-maroon-dark disabled:opacity-50 shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
