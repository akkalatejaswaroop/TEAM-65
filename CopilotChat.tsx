import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface CopilotChatProps {
  onSimulationAction: (action: any) => void;
}

const CopilotChat: React.FC<CopilotChatProps> = ({ onSimulationAction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Hello! I am your QuantumRail Copilot. You can ask me to simulate disruptions, create incidents, or analyze the network state.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToGemini(userMsg.content);
    
    setIsLoading(false);

    let assistantContent = "I didn't understand that.";
    
    if (response.type === 'SIMULATION_REQUEST') {
      assistantContent = `Processing simulation: ${response.action}. ${JSON.stringify(response.parameters)}`;
      onSimulationAction(response); // Trigger the app state change
    } else if (response.type === 'ANALYSIS' || response.type === 'ERROR') {
      assistantContent = response.message;
    }

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: assistantContent,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, assistantMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-80 shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <Bot className="text-cyan-400" /> What-if Copilot
        </h3>
        <button className="text-slate-500 hover:text-slate-300">
            <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600' : (msg.role === 'system' ? 'bg-slate-700' : 'bg-cyan-600')
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-lg text-sm max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' 
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={16} />
             </div>
             <div className="bg-slate-800 p-3 rounded-lg text-xs text-slate-400 flex items-center gap-1">
                Thinking <span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Simulate delay at Station A..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-10 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Powered by Gemini 2.5 Flash • Internal Preview
        </p>
      </div>
    </div>
  );
};

export default CopilotChat;
