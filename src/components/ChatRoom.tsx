import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Activity } from 'lucide-react';
import { SavedCharacter, ChatMessage } from '../store';
import { AIConfig, chatWithCharacter } from '../services/aiService';
import { motion } from 'motion/react';

interface ChatRoomProps {
  character: SavedCharacter;
  config: AIConfig;
  onSendMessage: (charId: string, message: ChatMessage) => void;
  onAssignJob?: (charId: string, locationId: string) => void;
  onNotification?: (msg: string, type: 'info' | 'success' | 'warning') => void;
}

export function ChatRoom({ character, config, onSendMessage, onAssignJob, onNotification }: ChatRoomProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [character.chatHistory, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || character.currentJob) {
      if (character.currentJob) alert('Nhân vật đang bận công việc, không thể chat lúc này.');
      return;
    }
    
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: Date.now() };
    onSendMessage(character.id, userMsg);
    setInput('');
    setIsTyping(true);

    const historyForAi = character.chatHistory
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));
    
    try {
      const { text, source, action, locationId } = await chatWithCharacter(
        userMsg.content,
        historyForAi,
        character,
        config
      );
      
      const assistantMsg: ChatMessage = { role: 'assistant', content: text, timestamp: Date.now() };
      onSendMessage(character.id, assistantMsg);
      if (onNotification) onNotification(`Phản hồi qua: ${source}`, 'info');

      if (action === 'assign_job' && locationId && onAssignJob) {
        onAssignJob(character.id, locationId);
        onSendMessage(character.id, { role: 'system', content: `Đã phân công đến địa điểm: ${locationId}`, timestamp: Date.now() });
      }

    } catch (e) {
      console.error(e);
      onSendMessage(character.id, { role: 'assistant', content: "*Hệ thống mất kết nối...*", timestamp: Date.now() });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden relative">
      <div className="bg-neutral-900 border-b border-neutral-800 py-3 px-4 flex justify-between items-center z-10 shrink-0">
        <h3 className="text-sm font-semibold text-neutral-300">Phòng phỏng vấn</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar">
        {character.chatHistory.length === 0 && (
          <div className="text-center text-neutral-500 text-sm mt-10">
            <p>Bắt đầu cuộc trò chuyện để hiểu thêm về {character.name}</p>
          </div>
        )}

        {character.chatHistory.map((msg, idx) => {
          if (msg.role === 'system') {
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={idx} className="flex justify-center my-2">
                <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1 rounded-full">{msg.content}</span>
              </motion.div>
            );
          }

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-neutral-800">
                <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-amber-600 outline-none text-white rounded-tr-sm shadow-sm' 
                  : 'bg-neutral-800 text-neutral-200 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
              {msg.timestamp && (
                <span className={`text-[10px] text-neutral-500 mt-1 font-mono ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 border border-neutral-700 text-neutral-400">
                <User size={16} />
              </div>
            )}
          </motion.div>
          );
        })}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start items-center"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-neutral-800">
              <img src={character.imageUrl} alt="Typing" className="w-full h-full object-cover grayscale opacity-70" />
            </div>
            <div className="bg-neutral-800 rounded-2xl p-3 rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex gap-2 z-10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isTyping}
          placeholder={`Nói gì đó với ${character.name}...`}
          className="flex-1 bg-neutral-950 border border-neutral-800 text-sm rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
