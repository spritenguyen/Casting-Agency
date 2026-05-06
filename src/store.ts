import { useState, useEffect } from 'react';
import { AIConfig } from './services/aiService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ActiveJob {
  locationId: string;
  startTime: number;
  endTime: number;
}

export interface SavedCharacter {
  id: string;
  name: string;
  bio: string;
  bodyStats: string;
  imageUrl: string;
  visualPrompt: string;
  createdAt: number;
  chatHistory: ChatMessage[];
  currentJob?: ActiveJob;
}

export interface Candidate extends SavedCharacter {
  hireCost: number;
}

export interface Currencies {
  cash: number;
  tokens: number;
  fame: number;
}

export type MissionType = 'cast_character' | 'chat_interaction';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardType: keyof Currencies;
  rewardAmount: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface GameNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
  read: boolean;
}

export interface LocationData {
  id: string;
  name: string;
  description: string;
  baseReward: number; 
  durationMinutes: number;
  imageTheme: string; 
}

export const CITY_LOCATIONS: LocationData[] = [
  { id: 'cine_studio', name: 'Phim trường Cine-Tech', description: 'Nơi sản xuất các dự án điện ảnh nội bộ.', baseReward: 800, durationMinutes: 10, imageTheme: 'from-blue-900 to-neutral-900' },
  { id: 'neon_bar', name: 'Quán Bar Neon', description: 'Giao lưu và làm phục vụ tại quán bar sầm uất.', baseReward: 300, durationMinutes: 1, imageTheme: 'from-pink-900 to-purple-900' },
  { id: 'royal_ktv', name: 'KTV Royal', description: 'Khu giải trí cao cấp dành cho khách VIP.', baseReward: 1200, durationMinutes: 15, imageTheme: 'from-amber-900 to-red-900' },
  { id: 'vogue_studio', name: 'Studio Thời Trang', description: 'Chụp ảnh bìa tạp chí danh tiếng.', baseReward: 2000, durationMinutes: 20, imageTheme: 'from-neutral-200 to-neutral-500' },
  { id: 'cyber_street', name: 'Phố Cyberpunk', description: 'Chụp ảnh street-style, tăng độ nhận diện.', baseReward: 500, durationMinutes: 5, imageTheme: 'from-cyan-900 to-blue-900' },
];

const DEFAULT_CONFIG: AIConfig = {
  useGoogleAI: false,
  googleApiKey: '',
};

const DEFAULT_CURRENCIES: Currencies = {
  cash: 10000,
  tokens: 10,
  fame: 0,
};

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', type: 'cast_character', title: 'Khởi đầu điện ảnh', description: 'Tuyển dụng 1 người mẫu vào Roster', target: 1, current: 0, rewardType: 'cash', rewardAmount: 5000, isCompleted: false, isClaimed: false },
  { id: 'm2', type: 'chat_interaction', title: 'Tiếp xúc nhân tài', description: 'Trò chuyện 5 tin nhắn với diễn viên', target: 5, current: 0, rewardType: 'fame', rewardAmount: 100, isCompleted: false, isClaimed: false },
  { id: 'm3', type: 'cast_character', title: 'Xây dựng đội ngũ', description: 'Sở hữu 3 diễn viên trong Roster', target: 3, current: 0, rewardType: 'tokens', rewardAmount: 20, isCompleted: false, isClaimed: false },
];

export function useGameState() {
  const [config, setConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('cine-tech-config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [currencies, setCurrencies] = useState<Currencies>(() => {
    const saved = localStorage.getItem('cine-tech-currencies');
    return saved ? JSON.parse(saved) : DEFAULT_CURRENCIES;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem('cine-tech-missions');
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  const [roster, setRoster] = useState<SavedCharacter[]>(() => {
    const saved = localStorage.getItem('cine-tech-roster');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          chatHistory: c.chatHistory || [],
          bodyStats: c.bodyStats || 'Không có dữ liệu hình thể',
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('cine-tech-candidates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          chatHistory: c.chatHistory || [],
          bodyStats: c.bodyStats || 'Không có dữ liệu hình thể',
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [notifications, setNotifications] = useState<GameNotification[]>(() => {
    const saved = localStorage.getItem('cine-tech-notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const addNotification = (message: string, type: GameNotification['type'] = 'info') => {
    setNotifications(prev => [{
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: Date.now(),
      read: false
    }, ...prev].slice(0, 50));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    localStorage.setItem('cine-tech-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('cine-tech-currencies', JSON.stringify(currencies));
  }, [currencies]);

  useEffect(() => {
    localStorage.setItem('cine-tech-missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('cine-tech-candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('cine-tech-notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('cine-tech-roster', JSON.stringify(roster));
    
    // Auto sync cast_character missions
    setMissions(prev => prev.map(m => {
      if (m.type === 'cast_character' && !m.isCompleted) {
        const isComp = roster.length >= m.target;
        if (isComp && !m.isCompleted) {
          addNotification(`Nhiệm vụ hoàn thành: ${m.title}`, 'success');
        }
        return { ...m, current: Math.min(roster.length, m.target), isCompleted: isComp };
      }
      return m;
    }));
  }, [roster]);

  const updateConfig = (newConfig: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const deductTokens = (amount: number): boolean => {
    if (currencies.tokens >= amount) {
      setCurrencies(prev => ({ ...prev, tokens: prev.tokens - amount }));
      return true;
    }
    return false;
  };

  const addCandidate = (char: Omit<Candidate, 'id' | 'createdAt'>) => {
    const newCand: Candidate = {
      ...char,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setCandidates(prev => [newCand, ...prev]);
    addNotification(`Ứng viên mới đã xuất hiện: ${char.name}`, 'info');
  };

  const removeCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const recruitCandidate = (id: string) => {
    const cand = candidates.find(c => c.id === id);
    if (!cand) return false;
    if (currencies.cash >= cand.hireCost) {
      setCurrencies(prev => ({
        ...prev,
        cash: prev.cash - cand.hireCost,
        fame: prev.fame + Math.floor(cand.hireCost / 100)
      }));
      setCandidates(prev => prev.filter(c => c.id !== id));
      const { hireCost, ...rosterChar } = cand;
      setRoster(prev => [rosterChar, ...prev]);
      addNotification(`Đã chiêu mộ: ${cand.name}`, 'success');
      return true;
    }
    return false;
  };

  const addCharacter = (char: Omit<SavedCharacter, 'id' | 'createdAt' | 'chatHistory'>) => {
    const newChar: SavedCharacter = {
      ...char,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      chatHistory: [],
    };
    setRoster(prev => [newChar, ...prev]);
    addNotification(`Đã cấp thẻ cư trú cho nhân vật mới: ${char.name}`, 'info');
  };

  const removeCharacter = (id: string) => {
    setRoster(prev => prev.filter(c => c.id !== id));
  };

  const addChatMessage = (characterId: string, message: ChatMessage, isCandidate = false) => {
    const updateList = (list: any[]) => list.map(char => {
      if (char.id === characterId) {
        return { ...char, chatHistory: [...char.chatHistory, message] };
      }
      return char;
    });

    if (isCandidate) {
      setCandidates(prev => updateList(prev));
    } else {
      setRoster(prev => updateList(prev));
    }

    if (message.role === 'user') {
      // Progress chat missions
      setMissions(prev => prev.map(m => {
        if (m.type === 'chat_interaction' && !m.isCompleted) {
          const newCurrent = m.current + 1;
          const isComp = newCurrent >= m.target;
          if (isComp) {
            addNotification(`Nhiệm vụ hoàn thành: ${m.title}`, 'success');
          }
          return { ...m, current: Math.min(newCurrent, m.target), isCompleted: isComp };
        }
        return m;
      }));
    }
  };

  const claimMissionReward = (missionId: string) => {
    setMissions(prev => {
      const ms = prev.find(m => m.id === missionId);
      if (ms && ms.isCompleted && !ms.isClaimed) {
        setCurrencies(c => ({
          ...c,
          [ms.rewardType]: c[ms.rewardType] + ms.rewardAmount
        }));
        addNotification(`Đã nhận thưởng nhiệm vụ: ${ms.title}`, 'success');
        return prev.map(m => m.id === missionId ? { ...m, isClaimed: true } : m);
      }
      return prev;
    });
  };

  const assignJob = (characterId: string, locationId: string) => {
    const loc = CITY_LOCATIONS.find(l => l.id === locationId);
    if (!loc) return false;
    
    setRoster(prev => {
      const char = prev.find(c => c.id === characterId);
      if (char) addNotification(`Đã phân công ${char.name} đến ${loc.name}`, 'info');
      
      return prev.map(c => {
        if (c.id === characterId) {
          return {
            ...c,
            currentJob: {
              locationId,
              startTime: Date.now(),
              endTime: Date.now() + loc.durationMinutes * 60000
            }
          };
        }
        return c;
      });
    });
    return true;
  };

  const claimJob = (characterId: string) => {
    let rewardToAdd = 0;
    let fameToAdd = 0;
    let charName = '';
    
    setRoster(prev => prev.map(char => {
      if (char.id === characterId && char.currentJob && Date.now() >= char.currentJob.endTime) {
        const loc = CITY_LOCATIONS.find(l => l.id === char.currentJob!.locationId);
        if (loc) {
          rewardToAdd = loc.baseReward;
          fameToAdd = Math.floor(loc.baseReward / 100);
          charName = char.name;
        }
        const { currentJob, ...rest } = char;
        return rest;
      }
      return char;
    }));

    if (rewardToAdd > 0) {
      setCurrencies(prev => ({
        ...prev,
        cash: prev.cash + rewardToAdd,
        fame: prev.fame + fameToAdd
      }));
      addNotification(`${charName} đã hoàn thành công việc! Thu về +$${rewardToAdd}`, 'success');
      return { rewardToAdd, fameToAdd };
    }
    return null;
  };

  return { 
    config, updateConfig, 
    currencies, deductTokens,
    missions, claimMissionReward, 
    roster, addCharacter, removeCharacter, assignJob, claimJob,
    candidates, addCandidate, removeCandidate, recruitCandidate,
    addChatMessage,
    notifications, addNotification, markNotificationRead, markAllNotificationsRead
  };
}
