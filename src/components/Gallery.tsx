import React, { useState } from 'react';
import { SavedCharacter, ChatMessage } from '../store';
import { AIConfig } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { UserMinus, X, Maximize2, FileText, Ruler, MessageCircle } from 'lucide-react';
import { ConfirmDialog } from './Dialog';
import { ChatRoom } from './ChatRoom';
import { BodyStatsDisplay } from './BodyStatsDisplay';

interface GalleryProps {
  roster: SavedCharacter[];
  config: AIConfig;
  onRemove: (id: string) => void;
  onChat: (id: string, message: ChatMessage) => void;
  onAssignJob: (charId: string, locId: string) => void;
  onNotification?: (msg: string, type: 'info' | 'success' | 'warning') => void;
}

export function Gallery({ roster, config, onRemove, onChat, onAssignJob, onNotification }: GalleryProps) {
  const [characterToRemove, setCharacterToRemove] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<SavedCharacter | null>(null);
  const [viewMode, setViewMode] = useState<'profile' | 'chat'>('profile');

  if (roster.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-500 font-serif italic">
        Chưa có người mẫu nào được chọn vào danh sách.
      </div>
    );
  }

  // Find the exact reference to avoid stale history
  const activeChar = selectedCharacter ? roster.find(r => r.id === selectedCharacter.id) || selectedCharacter : null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-serif text-white mb-6">Casting Roster ({roster.length})</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {roster.map((char) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={char.id}
              className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg h-[400px] cursor-pointer"
              onClick={() => {
                setSelectedCharacter(char);
                setViewMode('profile');
              }}
            >
              <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-xl font-serif text-white mb-1">{char.name}</h3>
                <p className="text-xs text-neutral-300 line-clamp-3 opacity-80 group-hover:opacity-100 transition-opacity">
                  {char.bio}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCharacterToRemove(char.id);
                }}
                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-2 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                title="Loại khỏi Roster"
              >
                <UserMinus size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        isOpen={!!characterToRemove}
        onClose={() => setCharacterToRemove(null)}
        onConfirm={() => {
          if (characterToRemove) {
            onRemove(characterToRemove);
            if (activeChar?.id === characterToRemove) {
                setSelectedCharacter(null);
            }
          }
        }}
        title="Loại bỏ người mẫu"
        message="Bạn có chắc chắn muốn hủy hồ sơ này khỏi danh sách Casting Roster không? Hành động này không thể hoàn tác."
        confirmText="Loại bỏ"
      />

      {/* Character Profile Detail Modal */}
      <AnimatePresence>
        {activeChar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedCharacter(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
            >
              <button
                onClick={() => setSelectedCharacter(null)}
                className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="md:w-1/2 h-[35vh] md:h-full relative shrink-0">
                 <img src={activeChar.imageUrl} alt={activeChar.name} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:bg-gradient-to-r" />
                 
                 <div className="absolute bottom-4 left-4 right-4 flex bg-neutral-900/60 backdrop-blur-md p-1 rounded-lg border border-white/10 z-10">
                    <button
                      onClick={() => setViewMode('profile')}
                      className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${viewMode === 'profile' ? 'bg-white text-black shadow-sm' : 'text-neutral-300 hover:text-white'}`}
                    >
                      <FileText size={16} /> Hồ Sơ
                    </button>
                    <button
                      onClick={() => setViewMode('chat')}
                      className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${viewMode === 'chat' ? 'bg-amber-500 text-black shadow-sm' : 'text-neutral-300 hover:text-white'}`}
                    >
                      <MessageCircle size={16} /> Phỏng Vấn Theo Dõi
                    </button>
                 </div>
              </div>

              <div className="md:w-1/2 flex flex-col overflow-hidden w-full h-full bg-neutral-900">
                {viewMode === 'profile' ? (
                  <div className="p-6 md:p-8 overflow-y-auto thin-scrollbar h-full">
                    <span className="text-amber-500 text-xs font-mono tracking-widest uppercase mb-2 block">Certified Roster Profile</span>
                    <h2 className="text-4xl font-serif text-white mb-6">{activeChar.name}</h2>
                    
                    <div className="space-y-6 flex-1">
                      <div>
                         <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                            <FileText size={16} /> Tiểu sử & Phong cách
                         </h3>
                         <p className="text-neutral-300 leading-relaxed font-sans text-sm">{activeChar.bio}</p>
                      </div>
                      
                      <div>
                         <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                            <Ruler size={16} /> Hình thể
                         </h3>
                         <div className="mt-2">
                           <BodyStatsDisplay bodyStats={activeChar.bodyStats} />
                         </div>
                      </div>

                      <div className="pt-6 border-t border-neutral-800 flex justify-between items-center">
                         <div className="text-xs text-neutral-500">
                           Ngày tạo: {new Date(activeChar.createdAt).toLocaleDateString('vi-VN')}
                         </div>
                         <button
                            onClick={() => setCharacterToRemove(activeChar.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 transition-colors"
                         >
                            <UserMinus size={16} /> Loại hồ sơ
                         </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ChatRoom 
                    character={activeChar} 
                    config={config} 
                    onSendMessage={onChat} 
                    onAssignJob={onAssignJob}
                    onNotification={onNotification}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
