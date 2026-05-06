import React, { useState, useEffect } from 'react';
import { CITY_LOCATIONS, SavedCharacter, Currencies } from '../store';
import { Map, MapPin, Clock, DollarSign, Target, Gift, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CityMapProps {
  roster: SavedCharacter[];
  currencies: Currencies;
  onClaimJob: (charId: string) => void;
}

export function CityMap({ roster, currencies, onClaimJob }: CityMapProps) {
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWorkersAtLocation = (locId: string) => {
    return roster.filter(c => c.currentJob?.locationId === locId);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-white flex items-center gap-3">
            <Map className="text-amber-500" /> Bản Đồ Thành Phố
          </h2>
          <p className="text-sm text-neutral-400 mt-1">Chat với người mẫu để điều phối họ đến làm việc ở các địa điểm kiếm tiền & danh tiếng.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CITY_LOCATIONS.map(loc => {
          const workers = getWorkersAtLocation(loc.id);
          const isSelected = selectedLoc === loc.id;
          
          return (
            <motion.div
              layout
              key={loc.id}
              onClick={() => setSelectedLoc(isSelected ? null : loc.id)}
              className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-amber-500 shadow-xl shadow-amber-900/20' : 'border-neutral-800 hover:border-neutral-700'} bg-neutral-900`}
            >
              <div className={`h-24 bg-gradient-to-r ${loc.imageTheme} opacity-40 shrink-0`} />
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-white font-serif">{loc.name}</h3>
                  <div className="bg-neutral-950 px-2 py-1 rounded text-xs font-mono text-emerald-400 flex items-center gap-1 border border-neutral-800">
                    <DollarSign size={12} /> {loc.baseReward.toLocaleString()}
                  </div>
                </div>
                
                <p className="text-xs text-neutral-400 mb-4 h-8">{loc.description}</p>
                
                <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono mb-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> {loc.durationMinutes} phút</span>
                  <span className="flex items-center gap-1"><Target size={14} /> +{Math.floor(loc.baseReward/100)} Fame</span>
                </div>

                <div className="border-t border-neutral-800 pt-4 mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nhân sự đang làm việc ({workers.length})</span>
                  </div>
                  
                  {workers.length === 0 ? (
                    <div className="text-xs text-neutral-600 italic py-2 flex items-center gap-1">
                      <HelpCircle size={12} /> Trống. Trò chuyện và phân công để nhận tiền.
                    </div>
                  ) : (
                    <div className="space-y-3 mt-3">
                      {workers.map(w => {
                        const job = w.currentJob!;
                        const isDone = currentTime >= job.endTime;
                        const progress = isDone ? 100 : Math.min(100, Math.max(0, ((currentTime - job.startTime) / (job.endTime - job.startTime)) * 100));
                        
                        return (
                          <div key={w.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 flex items-center gap-3">
                            <img src={w.imageUrl} alt={w.name} className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-medium text-white truncate pr-2">{w.name}</span>
                                {isDone ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onClaimJob(w.id);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-medium transition-colors whitespace-nowrap shadow-lg shadow-emerald-900/20 animate-pulse"
                                  >
                                    Nhận Thưởng
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-mono text-amber-500">{Math.ceil((job.endTime - currentTime)/60000)} phút</span>
                                )}
                              </div>
                              <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                                <div 
                                  className={`h-full transition-all duration-1000 ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
