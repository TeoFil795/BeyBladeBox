import React, { useState, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { ChatMessage, AppState, BeyCombo } from './types';
import { searchCombos, parseBeyCSV, INITIAL_DB } from './data/beyData';
import { askGemini } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // Initialize state with the EMBEDDED CSV DATA from beyData.ts
  const [db, setDb] = useState<BeyCombo[]>(INITIAL_DB);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAppState(AppState.ANALYZING); // Show processing state briefly

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const newCombos = parseBeyCSV(text);
        if (newCombos.length > 0) {
           setDb(newCombos);
           setMessages(prev => [...prev, {
             id: Date.now().toString(),
             role: 'system',
             content: `**SYSTEM UPDATE:** Database overridden manually. \n\nSource: \`${file.name}\`\nRecords: ${newCombos.length}\n\nRAG protocols updated.`,
             timestamp: Date.now()
           }]);
        } else {
           throw new Error("No valid Beyblade combos found in file.");
        }
      } catch (err) {
         console.error(err);
         setMessages(prev => [...prev, {
             id: Date.now().toString(),
             role: 'system',
             content: `**CRITICAL ERROR:** File parsing failed. Ensure CSV format matches protocol:\n\`id,rank,points,blade,ratchet,bit,wins,description\``,
             timestamp: Date.now()
           }]);
      } finally {
        setAppState(AppState.IDLE);
        // Reset input value to allow re-uploading same file if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || appState === AppState.SEARCHING) return;

    const userText = input.trim();
    setInput('');
    
    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setAppState(AppState.SEARCHING);

    try {
      // 2. Search Vector/keyword DB (uses current 'db' state)
      await new Promise(r => setTimeout(r, 600));
      // IMPORTANT: We pass the dynamic 'db' here!
      const relevantCombos = searchCombos(userText, db);
      
      setAppState(AppState.ANALYZING);

      // 3. Ask Gemini with the retrieved context
      const aiResponseText = await askGemini(userText, relevantCombos);

      // 4. Add AI Message
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponseText,
        relatedCombos: relevantCombos,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: "CRITICAL ERROR: Connection to Neural Net failed.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 md:p-6 overflow-hidden scanlines relative">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full opacity-20" />
      </div>

      {/* Main Terminal Window */}
      <div className="w-full max-w-5xl h-[90vh] bg-slate-950/90 border border-slate-800 shadow-2xl rounded-lg flex flex-col relative backdrop-blur-md overflow-hidden z-20">
        
        {/* Terminal Header */}
        <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <h1 className="text-green-500 font-display font-bold tracking-wider text-sm md:text-base ml-2">
                    BEYPAL_PUX // <span className="text-white">ANALYZER_V0.1</span>
                </h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Upload Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-[10px] font-mono bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-800/50 px-2 py-1 rounded transition-colors cursor-pointer"
                  title="Override with new CSV"
                >
                   <span className="font-bold">[^] UPLOAD_CSV</span>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept=".csv"
                    onChange={handleFileUpload}
                />

                <div className="text-[10px] font-mono text-gray-500 flex items-center gap-2 hidden md:flex">
                    <span className={`w-2 h-2 rounded-full ${appState !== AppState.IDLE ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                    {appState === AppState.IDLE ? 'STANDBY' : 'PROCESSING'}
                </div>
            </div>
        </div>

        {/* Terminal Body */}
        <Terminal messages={messages} isLoading={appState !== AppState.IDLE} />

        {/* Input Area */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 shrink-0">
          <form onSubmit={handleSubmit} className="relative">
             <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={appState !== AppState.IDLE}
                placeholder="Enter combo query..."
                className="w-full bg-slate-950 border border-slate-700 text-green-100 font-mono text-sm rounded p-4 pl-10 focus:outline-none focus:border-green-500/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] disabled:opacity-50 transition-all"
             />
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">{'>'}</div>
             <button 
                type="submit" 
                disabled={!input.trim() || appState !== AppState.IDLE}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-green-900/30 text-green-400 border border-green-800/50 rounded text-xs font-display hover:bg-green-800/50 hover:text-green-300 disabled:opacity-0 transition-all"
             >
                EXECUTE
             </button>
          </form>
          <div className="mt-2 flex justify-between text-[10px] text-gray-600 font-mono uppercase">
             <span>Engine: GEMINI-2.5-FLASH</span>
             <span className={db === INITIAL_DB ? "text-green-500" : "text-blue-400"}>
                Source: {db === INITIAL_DB ? 'EMBEDDED_CORE_DB' : 'MANUAL_OVERRIDE'}
             </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
