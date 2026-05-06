import React, { useState, useRef, useEffect } from 'react';
import { Camera, Settings as SettingsIcon, Users, Target, Ticket, TrendingUp, Mail, Map as MapIcon, Bell, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useGameState } from './store';
import { Settings } from './components/Settings';
import { CastingStudio } from './components/CastingStudio';
import { Gallery } from './components/Gallery';
import { MissionsPanel } from './components/Missions';
import { Inbox } from './components/Inbox';
import { CityMap } from './components/CityMap';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { config, updateConfig, roster, addCharacter, removeCharacter, currencies, deductTokens, missions, claimMissionReward, addChatMessage, candidates, addCandidate, removeCandidate, recruitCandidate, assignJob, claimJob, notifications, addNotification, markNotificationRead, markAllNotificationsRead } = useGameState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'studio' | 'roster' | 'missions' | 'city'>('inbox');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uncompletedMissions = missions.filter(m => m.isCompleted && !m.isClaimed).length;
  const readyJobs = roster.filter(c => c.currentJob && Date.now() >= c.currentJob.endTime).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const NavigationMenu = ({ isMobile = false }) => (
    <div className={`flex ${isMobile ? 'justify-around w-full' : 'bg-neutral-900 rounded-lg p-1 shrink-0'}`}>
      <button
        onClick={() => setActiveTab('inbox')}
        className={`px-3 py-2 md:py-1.5 rounded-md text-sm font-medium transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 relative ${activeTab === 'inbox' ? 'text-amber-500 md:bg-white md:text-black md:shadow-sm' : 'text-neutral-400 hover:text-white'}`}
      >
        <Mail size={isMobile ? 20 : 16} /> <span className={`${isMobile ? 'text-[10px]' : ''}`}>Inbox</span>
        {candidates.length > 0 && (
          <span className="absolute top-0 right-1 md:-top-1 md:-right-1 w-4 h-4 bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center rounded-full">
            {candidates.length}
          </span>
        )}
      </button>
      <button
        onClick={() => setActiveTab('city')}
        className={`px-3 py-2 md:py-1.5 rounded-md text-sm font-medium transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 relative ${activeTab === 'city' ? 'text-emerald-400 md:bg-white md:text-black md:shadow-sm' : 'text-neutral-400 hover:text-white'}`}
      >
        <MapIcon size={isMobile ? 20 : 16} /> <span className={`${isMobile ? 'text-[10px]' : ''}`}>City</span>
        {readyJobs > 0 && (
          <span className="absolute top-0 right-1 md:-top-1 md:-right-1 w-4 h-4 bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-neutral-950 md:border-neutral-900">
            {readyJobs}
          </span>
        )}
      </button>
      <button
        onClick={() => setActiveTab('studio')}
        className={`px-3 py-2 md:py-1.5 rounded-md text-sm font-medium transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 ${activeTab === 'studio' ? 'text-amber-500 md:bg-white md:text-black md:shadow-sm' : 'text-neutral-400 hover:text-white'}`}
      >
        <Camera size={isMobile ? 20 : 16} className="md:hidden" /> <span className={`${isMobile ? 'text-[10px]' : ''}`}>Casting</span>
      </button>
      <button
        onClick={() => setActiveTab('roster')}
        className={`px-3 py-2 md:py-1.5 rounded-md text-sm font-medium transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 ${activeTab === 'roster' ? 'text-white md:bg-white md:text-black md:shadow-sm' : 'text-neutral-400 hover:text-white'}`}
      >
        <Users size={isMobile ? 20 : 16} /> <span className={`${isMobile ? 'text-[10px]' : ''}`}>Roster</span>
      </button>
      <button
        onClick={() => setActiveTab('missions')}
        className={`px-3 py-2 md:py-1.5 rounded-md text-sm font-medium transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 relative ${activeTab === 'missions' ? 'text-amber-500 md:bg-white md:text-black md:shadow-sm' : 'text-neutral-400 hover:text-white'}`}
      >
        <Target size={isMobile ? 20 : 16} /> <span className={`${isMobile ? 'text-[10px]' : ''}`}>Missions</span>
        {uncompletedMissions > 0 && (
          <span className="absolute top-1 right-2 md:-top-1 md:-right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-neutral-950 md:border-neutral-900" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-neutral-950 text-neutral-200 selection:bg-amber-500/30 font-sans pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-black">
                <Camera size={20} />
              </div>
              <h1 className="font-serif text-lg md:text-xl font-bold tracking-wide hidden sm:block">CINE-TECH<span className="text-amber-500">.</span></h1>
            </div>

            {/* Currencies HUD */}
            <div className="flex items-center gap-2 md:gap-4 ml-2 sm:ml-6 sm:pl-6 sm:border-l border-neutral-800">
              <div className="flex items-center gap-1 md:gap-1.5 bg-neutral-900/50 px-2 md:px-3 py-1 rounded-full border border-emerald-900/30" title="Cash">
                <strong className="text-emerald-400 text-xs md:text-base">$</strong>
                <span className="font-mono text-xs md:text-sm tracking-tight">{currencies.cash.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 bg-neutral-900/50 px-2 md:px-3 py-1 rounded-full border border-amber-900/30" title="CineTokens">
                <Ticket size={12} className="text-amber-400 md:w-3.5 md:h-3.5" />
                <span className="font-mono text-xs md:text-sm tracking-tight">{currencies.tokens.toLocaleString()}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-neutral-900/50 px-3 py-1 rounded-full border border-purple-900/30" title="Fame">
                <TrendingUp size={14} className="text-purple-400" />
                <span className="font-mono text-sm tracking-tight">{currencies.fame.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="hidden md:block">
              <NavigationMenu />
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full transition-colors flex-shrink-0 relative"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-neutral-950" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 max-h-96 flex flex-col bg-neutral-900 border border-neutral-800 shadow-xl rounded-xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
                      <h3 className="font-medium text-white">Thông báo</h3>
                      {unreadNotifications > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-xs text-amber-500 hover:text-amber-400">
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto thin-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500 text-sm">
                          Chưa có thông báo nào.
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-800/50">
                          {notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              className={`p-3 md:p-4 hover:bg-neutral-800/50 transition-colors flex gap-3 ${!notif.read ? 'bg-amber-950/10' : ''}`}
                              onClick={() => !notif.read && markNotificationRead(notif.id)}
                            >
                              <div className="mt-0.5">
                                {notif.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                                 notif.type === 'warning' ? <Target size={16} className="text-amber-500" /> :
                                 <Mail size={16} className="text-blue-400" />}
                              </div>
                              <div>
                                <p className={`text-sm ${!notif.read ? 'text-white' : 'text-neutral-400'}`}>{notif.message}</p>
                                <p className="text-[10px] text-neutral-500 mt-1 font-mono">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                              </div>
                              {!notif.read && (
                                <div className="ml-auto flex items-center h-full">
                                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full transition-colors flex-shrink-0"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100dvh-4rem-4rem)] md:min-h-[calc(100vh-4rem)]">
        {activeTab === 'inbox' && (
          <Inbox 
            candidates={candidates}
            onAddCandidate={addCandidate}
            onRemoveCandidate={removeCandidate}
            onRecruit={recruitCandidate}
            onChat={addChatMessage}
            config={config}
            currencies={currencies}
            fame={currencies.fame}
            rosterCount={roster.length}
            deductTokens={deductTokens}
            onNotification={addNotification}
          />
        )}
        {activeTab === 'city' && (
          <CityMap roster={roster} currencies={currencies} onClaimJob={claimJob} />
        )}
        {activeTab === 'studio' && (
          <CastingStudio config={config} onSaveCharacter={addCharacter} onNotification={addNotification} />
        )}
        {activeTab === 'roster' && (
          <Gallery roster={roster} onRemove={removeCharacter} onChat={(id, m) => addChatMessage(id, m, false)} config={config} onAssignJob={assignJob} onNotification={addNotification} />
        )}
        {activeTab === 'missions' && (
          <MissionsPanel missions={missions} currencies={currencies} onClaim={claimMissionReward} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-white/5 pb-safe">
        <NavigationMenu isMobile={true} />
      </nav>

      <Settings
        config={config}
        updateConfig={updateConfig}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
