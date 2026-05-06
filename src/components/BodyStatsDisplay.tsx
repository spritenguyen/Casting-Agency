import React from 'react';

interface BodyStatsDisplayProps {
  bodyStats: string;
}

export function BodyStatsDisplay({ bodyStats }: BodyStatsDisplayProps) {
  if (!bodyStats || bodyStats === 'Không có dữ liệu hình thể' || bodyStats === 'Không rõ') {
    return (
      <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-neutral-300 text-sm col-span-2">
        Không có dữ liệu.
      </div>
    );
  }

  // Split by common delimiters and handle cases with or without colons
  const stats = bodyStats.split(/[,;\n|]/).map(s => s.trim()).filter(Boolean);

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => {
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
      })}
    </div>
  );
}
