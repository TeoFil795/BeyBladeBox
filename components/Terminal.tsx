import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, BeyCombo } from '../types';
import ReactMarkdown from 'react-markdown';
import { ComboCard } from './ComboCard';

interface TerminalProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

// --- Internal Component: Advanced Loading Visualization ---
const LoadingPanel: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const possibleLogs = [
    "INIT_HANDSHAKE_PROTOCOL...",
    "DECRYPTING_USER_QUERY...",
    "ACCESSING_BEY_ARCHIVES_V2.1...",
    "FILTERING_LOW_RANK_DATA...",
    "CALCULATING_WIN_PROBABILITIES...",
    "CROSS_REFERENCING_META_TIERS...",
    "OPTIMIZING_BIT_PERFORMANCE...",
    "ESTABLISHING_NEURAL_LINK...",
    "GENERATING_TACTICAL_OUTPUT..."
  ];

  useEffect(() => {
    // Progress bar simulation (asymptotically approaches 98%)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const remaining = 100 - prev;
        const jump = Math.random() * (remaining * 0.2); // Slows down as it gets fuller
        return Math.min(prev + jump, 98);
      });
    }, 200);

    // Log line simulation
    const logInterval = setInterval(() => {
      setLogs(prev => {
        const nextLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
        const newLogs = [...prev, `> ${nextLog} [${Math.floor(Math.random() * 50)}ms]`];
        return newLogs.slice(-4); // Keep last 4 lines
      });
    }, 450);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="max-w-[85%] md:max-w-[70%] w-full">
      <div className="bg-slate-950/80 border border-green-500/30 p-4 rounded-sm relative overflow-hidden group">
        {/* Scanline overlay for loading box */}
        <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
        
        <div className="flex justify-between items-center mb-3 border-b border-green-900/50 pb-2">
            <span className="text-xs text-green-400 font-bold tracking-widest animate-pulse">PROCESSING_REQUEST</span>
            <span className="text-[10px] text-green-600 font-mono">PID: {Math.floor(Math.random() * 9999)}</span>
        </div>

        {/* Scrolling Data Stream */}
        <div className="font-mono text-[10px] text-green-300/70 h-16 flex flex-col justify-end mb-4 space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="truncate border-l-2 border-green-500/20 pl-2 animate-pulse">
              {log}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="relative">
            <div className="flex justify-between text-[10px] text-green-500 mb-1 font-mono">
                <span>COMPLETION</span>
                <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-slate-900 w-full rounded-full overflow-hidden border border-green-900">
                <div 
                    className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]" 
                    style={{ width: `${progress}%`, transition: 'width 0.2s ease-out' }}
                />
            </div>
        </div>
      </div>
    </div>
  );
};


export const Terminal: React.FC<TerminalProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 font-mono custom-scrollbar relative z-10">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-50 mt-20 select-none">
          <div className="text-6xl text-green-500 mb-4 animate-pulse">X</div>
          <p className="text-green-400/70 font-display text-xl tracking-widest">BEYBLADE X-PERT</p>
          <p className="text-xs text-green-600/50 mt-2">/// WAITING_FOR_INPUT ///</p>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
          
          {/* Message Bubble */}
          <div 
            className={`max-w-[85%] md:max-w-[70%] p-4 rounded-sm border shadow-lg backdrop-blur-sm ${
              msg.role === 'user' 
                ? 'bg-slate-900/90 border-blue-500/30 text-blue-100' 
                : 'bg-slate-950/90 border-green-500/30 text-green-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1 select-none">
                <span className={`text-[10px] font-bold tracking-wider ${msg.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                    {msg.role === 'user' ? '>> OPERATOR' : '>> SYSTEM_AI'}
                </span>
                <span className="text-[10px] text-gray-600 ml-auto">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            
            <div className="prose prose-invert prose-sm prose-p:leading-relaxed prose-strong:text-white prose-strong:font-display">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>

          {/* Related Combos Display (Only for AI) */}
          {msg.role === 'ai' && msg.relatedCombos && msg.relatedCombos.length > 0 && (
             <div className="mt-4 w-full max-w-[85%] md:max-w-[70%]">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-green-900/50"></div>
                    <p className="text-[10px] text-green-600 tracking-[0.2em]">/// RETRIEVED_DATA_FRAGMENTS</p>
                    <div className="h-px flex-1 bg-green-900/50"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {msg.relatedCombos.slice(0, 4).map(combo => (
                        <ComboCard key={combo.id} combo={combo} />
                    ))}
                </div>
             </div>
          )}
        </div>
      ))}

      {isLoading && <LoadingPanel />}
      
      <div ref={bottomRef} />
    </div>
  );
};
