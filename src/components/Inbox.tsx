import React, { useState } from 'react';
import { SavedCharacter, Candidate, Currencies } from '../store';
import { AIConfig, autoScoutCharacter, generateImageBlobUrl } from '../services/aiService';
import { Mail, Briefcase, Activity, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatRoom } from './ChatRoom';

interface InboxProps {
  candidates: Candidate[];
  onAddCandidate: (cand: Omit<Candidate, 'id' | 'createdAt'>) => void;
  onRemoveCandidate: (id: string) => void;
  onRecruit: (id: string) => boolean;
  onChat: (id: string, message: any, isCand: boolean) => void;
  config: AIConfig;
  currencies: Currencies;
  fame: number;
  rosterCount: number;
  deductTokens: (amount: number) => boolean;
  onNotification?: (msg: string, type: 'info' | 'success' | 'warning') => void;
}

export function Inbox({ candidates, onAddCandidate, onRemoveCandidate, onRecruit, onChat, config, currencies, fame, rosterCount, deductTokens, onNotification }: InboxProps) {
  const [isScouting, setIsScouting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const activeCand = selectedCandidate ? candidates.find(c => c.id === selectedCandidate.id) || selectedCandidate : null;

  const handleScout = async () => {
    if (currencies.tokens < 1) {
      alert("Không đủ CineTokens để sử dụng Tuyển Trạch Viên Tự Động.");
      return;
    }
    
    if (!deductTokens(1)) return;

    setIsScouting(true);
    try {
      const { profile } = await autoScoutCharacter({ fame, rosterCount }, config);
      const { url } = await generateImageBlobUrl(profile.visualPrompt);
      
      const newCand: Omit<Candidate, 'id' | 'createdAt'> = {
        name: profile.name,
        bio: profile.bio,
        bodyStats: profile.bodyStats,
        visualPrompt: profile.visualPrompt,
        imageUrl: url,
        hireCost: Math.floor(Math.random() * 3000) + 1000 + (fame * 10), // dynamically generated
        chatHistory: [
          { role: 'assistant', content: profile.initialMessage, timestamp: Date.now() }
        ]
      };
      
      onAddCandidate(newCand);
    } catch (e) {
      console.error(e);
      alert("Casting thất bại, đã xảy ra lỗi do hệ thống mạng.");
    } finally {
      setIsScouting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
      {/* Left List */}
      <div className="w-full lg:w-1/3 flex flex-col border border-neutral-800 rounded-2xl bg-neutral-900/50 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center z-10 shrink-0">
          <h2 className="font-serif text-white font-semibold flex items-center gap-2">
            <Mail className="text-amber-500" size={18} /> Hộp Thư Casting 
            <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 rounded-full">{candidates.length}</span>
          </h2>
          
          <button 
            onClick={handleScout}
            disabled={isScouting}
            className="text-xs bg-neutral-800 hover:bg-amber-600 hover:text-white text-neutral-400 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-neutral-700 hover:border-amber-500 disabled:opacity-50"
          >
            {isScouting ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />} Auto Scout (1 Token)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto thin-scrollbar p-2 space-y-2">
          {candidates.length === 0 && !isScouting ? (
            <div className="text-center p-8 text-neutral-500 text-sm">
              Hộp thư trống. Dùng Auto Scout để AI tự tìm kiếm ứng viên dựa trên trạng thái danh tiếng của bạn.
            </div>
          ) : null}

          <AnimatePresence>
            {isScouting && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-neutral-800/50 border border-neutral-700/50 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-neutral-700 shrink-0" />
                  <div>
                    <div className="h-4 w-24 bg-neutral-700 rounded mb-2" />
                    <div className="h-3 w-32 bg-neutral-700 rounded" />
                  </div>
                </div>
              </motion.div>
            )}

            {candidates.map(cand => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={cand.id}
                onClick={() => setSelectedCandidate(cand)}
                className={`p-3 rounded-xl cursor-pointer border transition-all flex gap-3 ${activeCand?.id === cand.id ? 'bg-neutral-800 border-amber-500 shadow-md shadow-amber-900/10' : 'bg-neutral-900/40 border-transparent hover:bg-neutral-800'}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-neutral-700">
                  <img src={cand.imageUrl} alt={cand.name} className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h3 className="text-sm font-semibold text-white truncate">{cand.name}</h3>
                  <p className="text-xs text-neutral-400 truncate mt-1">
                    {cand.chatHistory.length > 0 ? cand.chatHistory[cand.chatHistory.length - 1].content : 'Đã gửi yêu cầu phỏng vấn'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full lg:w-2/3 flex flex-col border border-neutral-800 rounded-2xl bg-neutral-900 overflow-hidden shadow-xl relative">
        {activeCand ? (
          <>
            <div className="h-48 border-b border-neutral-800 relative shrink-0">
               <img src={activeCand.imageUrl} alt={activeCand.name} className="w-full h-full object-cover opacity-30 blur-sm" />
               <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
               <div className="absolute bottom-4 left-6 flex items-end gap-6">
                 <div className="w-24 h-24 rounded-full border-4 border-neutral-900 overflow-hidden bg-black shadow-xl">
                   <img src={activeCand.imageUrl} alt={activeCand.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="mb-2">
                   <h2 className="text-2xl font-serif text-white">{activeCand.name}</h2>
                   <div className="flex gap-4 text-xs font-mono mt-2">
                     <span className="text-emerald-400 flex items-center gap-1"><Briefcase size={14} /> Mức lương: ${activeCand.hireCost.toLocaleString()}</span>
                   </div>
                 </div>
               </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
               <div className="flex-1 border-r border-neutral-800">
                  <ChatRoom character={activeCand} config={config} onSendMessage={(id, msg) => onChat(id, msg, true)} onNotification={onNotification} />
               </div>
               
               <div className="w-64 bg-neutral-950 p-4 overflow-y-auto thin-scrollbar shrink-0 flex flex-col gap-4">
                  <span className="text-amber-500 text-[10px] font-mono tracking-widest uppercase block">Context Profile</span>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-1">Tiểu sử</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">{activeCand.bio}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-1">Hình thể</h4>
                    <p className="text-xs text-neutral-300 font-sans">{activeCand.bodyStats}</p>
                  </div>
                  <div className="mt-auto pt-4 space-y-2 border-t border-neutral-800">
                     <button
                       onClick={() => {
                         if (!onRecruit(activeCand.id)) {
                           alert('Không đủ Cash để ký hợp đồng.');
                         } else {
                           setSelectedCandidate(null);
                         }
                       }}
                       className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                     >
                        <CheckCircle size={16} /> Ký Hợp Đồng
                     </button>
                     <button
                       onClick={() => {
                         onRemoveCandidate(activeCand.id);
                         setSelectedCandidate(null);
                       }}
                       className="w-full py-2 bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 rounded-lg text-sm transition-colors"
                     >
                        Từ Chối
                     </button>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8">
            <Mail size={48} className="mb-4 opacity-50" />
            <p className="font-serif text-lg">Chọn một ứng viên để phỏng vấn</p>
            <p className="text-sm mt-2 max-w-sm text-center">Các nhân vật xin việc sẽ được AI tạo ra với ngữ cảnh và tính cách riêng, tự động nhắn tin cho bạn xin việc.</p>
          </div>
        )}
      </div>
    </div>
  );
}
