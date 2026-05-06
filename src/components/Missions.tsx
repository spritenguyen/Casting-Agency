import React from 'react';
import { Target, CheckCircle2, Ticket, TrendingUp, Gift } from 'lucide-react';
import { Mission, Currencies } from '../store';
import { motion } from 'motion/react';

interface MissionsProps {
  missions: Mission[];
  currencies: Currencies;
  onClaim: (id: string) => void;
}

export function MissionsPanel({ missions, currencies, onClaim }: MissionsProps) {
  const getRewardIcon = (type: keyof Currencies) => {
    switch (type) {
      case 'cash': return <strong className="text-emerald-400">$</strong>;
      case 'tokens': return <Ticket size={16} className="text-amber-400 inline" />;
      case 'fame': return <TrendingUp size={16} className="text-purple-400 inline" />;
    }
  };

  const getRewardColor = (type: keyof Currencies) => {
    switch (type) {
      case 'cash': return 'text-emerald-400';
      case 'tokens': return 'text-amber-400';
      case 'fame': return 'text-purple-400';
    }
  };

  const getRewardLabel = (type: keyof Currencies) => {
    switch (type) {
      case 'cash': return 'Cash';
      case 'tokens': return 'CineTokens';
      case 'fame': return 'Fame';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-white flex items-center gap-3">
            <Target className="text-amber-500" /> Bảng Nhiệm Vụ
          </h2>
          <p className="text-sm text-neutral-400 mt-1">Hoàn thành nhiệm vụ để phát triển danh tiếng Studio.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {missions.map(mission => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={mission.id} 
            className={`bg-neutral-900 border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-colors
              ${mission.isClaimed ? 'border-neutral-800 opacity-60' : mission.isCompleted ? 'border-amber-500/50 shadow-lg shadow-amber-900/10 bg-amber-950/20' : 'border-neutral-800'}
            `}
          >
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-200 text-lg flex items-center gap-2">
                {mission.title}
                {mission.isClaimed && <CheckCircle2 size={16} className="text-neutral-500" />}
              </h3>
              <p className="text-neutral-400 text-sm mt-1">{mission.description}</p>
              
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-neutral-400 whitespace-nowrap">
                  {mission.current} / {mission.target}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-800">
              <div className="flex flex-col items-end flex-1 md:flex-none">
                <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Phần thưởng</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${getRewardColor(mission.rewardType)}`}>
                  +{mission.rewardAmount} {getRewardIcon(mission.rewardType)} {getRewardLabel(mission.rewardType)}
                </span>
              </div>
              
              <button
                onClick={() => onClaim(mission.id)}
                disabled={!mission.isCompleted || mission.isClaimed}
                className={`px-6 py-2 rounded-lg font-medium text-sm border transition-all
                  ${mission.isClaimed 
                    ? 'bg-neutral-800/50 border-neutral-700/50 text-neutral-500 cursor-not-allowed' 
                    : mission.isCompleted 
                      ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500 shadow-lg shadow-amber-900/20 animate-pulse' 
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 cursor-not-allowed'
                  }
                `}
              >
                {mission.isClaimed ? 'Đã Nhận' : mission.isCompleted ? 'Nhận Ngay' : 'Chưa Mở'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
