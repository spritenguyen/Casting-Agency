import React, { useState } from 'react';
import { Camera, Sparkles, Loader2, Save, Activity, Ruler, FileText } from 'lucide-react';
import { generateProfile, generateImageBlobUrl, CharacterProfile, AIConfig } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';

interface CastingStudioProps {
  config: AIConfig;
  onSaveCharacter: (char: CharacterProfile & { imageUrl: string }) => void;
  onNotification?: (msg: string, type: 'info' | 'success' | 'warning') => void;
}

type ProcessState = 'idle' | 'generating_profile' | 'generating_image' | 'done';

export function CastingStudio({ config, onSaveCharacter, onNotification }: CastingStudioProps) {
  const [prompt, setPrompt] = useState('');
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleCast = async () => {
    if (!prompt.trim()) return;
    
    setError(null);
    setProfile(null);
    setImageUrl(null);
    setProcessState('generating_profile');

    try {
      // Step 1: Text Generation
      const { profile: charProfile, source: textSource } = await generateProfile(prompt, config);
      setProfile(charProfile);
      setProcessState('generating_image');
      if (onNotification) onNotification(`Nội suy hồ sơ qua: ${textSource}`, 'info');

      // Step 2: Image Generation
      const { url: imgUrl, source: imageSource } = await generateImageBlobUrl(charProfile.visualPrompt);
      setImageUrl(imgUrl);
      if (onNotification) onNotification(`Tạo ảnh qua: ${imageSource}`, 'info');
      setProcessState('done');
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi cố gắng nội suy thông tin hoặc tạo ảnh. Vui lòng thử lại.');
      setProcessState('idle');
    }
  };

  const handeSave = () => {
    if (profile && imageUrl) {
      onSaveCharacter({ ...profile, imageUrl });
      // Reset for next
      setPrompt('');
      setProfile(null);
      setImageUrl(null);
      setProcessState('idle');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Input Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-800 via-amber-500 to-neutral-800 opacity-50" />
        
        <h2 className="text-2xl font-serif font-bold text-white mb-2 flex items-center gap-3">
          <Camera className="text-amber-500" /> Casting Mới
        </h2>
        <p className="text-neutral-400 text-sm mb-6">
          Miêu tả nhan sắc, phong cách hoặc nguồn gốc. Hệ thống AI sẽ nội suy và tìm kiếm hình mẫu điện ảnh phù hợp nhất.
        </p>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={processState !== 'idle' && processState !== 'done'}
            placeholder="VD: Nam diễn viên 28 tuổi, cựu vận động viên bơi lội, gương mặt góc cạnh châu Á pha Pháp, phong cách minimalism..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 min-h-[120px] text-neutral-200 focus:outline-none focus:border-amber-500/50 transition-all resize-none disabled:opacity-50"
          />
          
          <button
            onClick={handleCast}
            disabled={!prompt.trim() || processState === 'generating_profile' || processState === 'generating_image'}
            className="absolute bottom-4 right-4 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-800 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-amber-900/20 disabled:shadow-none flex items-center gap-2"
          >
            {processState === 'generating_profile' && <><Loader2 className="animate-spin" size={18} /> Đang nội suy hồ sơ...</>}
            {processState === 'generating_image' && <><Loader2 className="animate-spin" size={18} /> Đang lên hình...</>}
            {processState === 'idle' || processState === 'done' ? <><Sparkles size={18} /> Tìm kiếm & Casting</> : null}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {processState === 'done' && profile && imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
          >
            {/* Image Portait */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
              <img src={imageUrl} alt={profile.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                <span className="text-amber-500 text-xs font-mono tracking-widest uppercase mb-1 block">Cine-Tech Model</span>
                <h3 className="text-3xl font-serif text-white">{profile.name}</h3>
              </div>
            </div>

            {/* Profile Detail */}
            <div className="space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                    <Ruler size={16} /> Thông Tin Hình Thể
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {profile.bodyStats ? profile.bodyStats.split(/[,;\n|]/).map(s => s.trim()).filter(Boolean).map((stat, i) => {
                      const colonIdx = stat.indexOf(':');
                      if (colonIdx > -1) {
                         const lbl = stat.substring(0, colonIdx).trim();
                         const val = stat.substring(colonIdx + 1).trim();
                         return (
                            <div key={i} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex flex-col justify-center">
                               <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-1 line-clamp-1">{lbl}</span>
                               <span className="text-amber-500 font-mono text-sm line-clamp-1">{val}</span>
                            </div>
                         );
                      }
                      return (
                         <div key={i} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center col-span-2 md:col-span-1">
                            <span className="text-neutral-300 text-xs">{stat}</span>
                         </div>
                      );
                    }) : (
                      <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-neutral-300 text-sm col-span-2">
                        Không có dữ liệu.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                     <FileText size={16} /> Tiểu sử & Phong cách
                  </h4>
                  <p className="text-neutral-200 leading-relaxed font-sans text-sm bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    {profile.bio}
                  </p>
                </div>
              </div>

              <button
                onClick={handeSave}
                className="w-full py-4 bg-white text-black hover:bg-neutral-200 rounded-xl font-medium flex justify-center items-center gap-2 transition-transform active:scale-95"
              >
                <Save size={20} /> Lý lịch Đạt chuẩn - Lưu vào Roster
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
