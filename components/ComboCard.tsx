import React from 'react';
import { BeyCombo } from '../types';

interface ComboCardProps {
  combo: BeyCombo;
}

const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex items-center gap-2 text-xs mb-1">
    <span className="w-8 font-mono text-gray-400">{label}</span>
    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} shadow-[0_0_5px_currentColor]`} 
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  </div>
);

export const ComboCard: React.FC<ComboCardProps> = ({ combo }) => {
  // Heuristic stats generation based on component names for visuals
  const isAttack = ['Flat', 'Rush', 'Low', 'Shark', 'Dran', 'Phoenix'].some(k => 
    (combo.bit + combo.blade).includes(k));
  const isStamina = ['Ball', 'Rod', 'Orb', 'Wizard'].some(k => 
    (combo.bit + combo.blade).includes(k));

  const atk = isAttack ? 90 : isStamina ? 40 : 60;
  const sta = isStamina ? 95 : isAttack ? 30 : 60;
  const def = combo.bit.includes('Needle') || combo.bit.includes('Hexa') ? 85 : 50;

  return (
    <div className="relative group border border-green-900/50 bg-slate-900/80 backdrop-blur-sm p-3 rounded-sm hover:border-green-500/50 transition-all duration-300 w-full max-w-sm">
      {/* Holographic Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-500" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-500" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-500" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-500" />

      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
            <span className="text-[10px] text-green-500 font-mono tracking-widest">RANK #{combo.rank.toString().padStart(2, '0')}</span>
            <h3 className="text-green-300 font-display font-bold text-lg leading-tight truncate">{combo.blade}</h3>
        </div>
        <div className="text-right">
             <span className="text-[10px] text-blue-400 font-mono block">WINS</span>
             <span className="text-blue-300 font-bold font-mono">{combo.wins}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 mb-3">
        <div className="bg-slate-950 border border-slate-800 p-1 text-center rounded">
            <div className="text-[9px] text-gray-500 uppercase">Blade</div>
            <div className="text-xs font-bold text-white truncate">{combo.blade}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-1 text-center rounded">
            <div className="text-[9px] text-gray-500 uppercase">Ratchet</div>
            <div className="text-xs font-bold text-yellow-400 truncate">{combo.ratchet}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-1 text-center rounded">
            <div className="text-[9px] text-gray-500 uppercase">Bit</div>
            <div className="text-xs font-bold text-pink-400 truncate">{combo.bit}</div>
        </div>
      </div>

      <div className="space-y-1">
        <StatBar label="ATK" value={atk} color="bg-red-500" />
        <StatBar label="DEF" value={def} color="bg-blue-500" />
        <StatBar label="STA" value={sta} color="bg-yellow-500" />
      </div>
      
      <div className="mt-2 pt-2 border-t border-slate-800">
        <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">
          {combo.description}
        </p>
      </div>
    </div>
  );
};