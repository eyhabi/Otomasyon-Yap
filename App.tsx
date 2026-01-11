import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Send, Menu, Plus, Settings, Cpu, Server, Database, Activity, DollarSign, FileJson, FileText, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { Message, ChatState, AppSettings } from './types';
import { MessageBubble } from './components/MessageBubble';
import { initializeGemini, sendMessageToGemini } from './services/gemini';

const App: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
        {
            id: 'welcome',
            role: 'model',
            content: "Merhaba Halil Bey. Ben n8n mimari asistanınız Sen.\n\nÖzellikle **AI Agent** kurguları, AWS dağıtımları ve NotebookLM entegrasyonlarında uzmanım. \n\nPanelden 'Ücretli Araçlar' ayarını seçtiğinizde, ona uygun (OpenAI vs Ollama) Agent tasarımları yapabilirim.",
            timestamp: new Date()
        }
    ],
    isLoading: false,
    error: null,
  });

  const [input, setInput] = useState('');
  
  // Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({
    allowPaidTools: true,
    outputFormat: 'json'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  useEffect(() => {
      // Initialize Gemini on mount
      initializeGemini();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    
    const currentInput = input;
    setInput('');

    try {
      const responseText = await sendMessageToGemini(currentInput, appSettings);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
      }));
    } catch (err) {
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Bir hata oluştu. Lütfen tekrar deneyin.",
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar - Mobile Toggle */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center">
                    <Cpu size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">n8n Architect</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 border border-rose-600/20 rounded-xl transition-all group">
                    <Plus size={18} />
                    <span className="font-medium text-sm">Yeni Otomasyon</span>
                </button>

                <div className="mt-8">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Sistem Durumu</h4>
                    <div className="space-y-3 px-2">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Activity size={16} className="text-emerald-500" />
                            <span>API Bağlantısı: Aktif</span>
                        </div>
                         <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Server size={16} className="text-indigo-500" />
                            <span>Model: Gemini 3 Pro</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Globe size={16} className="text-sky-500" />
                            <span>Web Arama: Aktif</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        HP
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Halil (Patron)</span>
                        <span className="text-xs text-slate-500">Admin Erişimi</span>
                    </div>
                    <Settings size={16} className="ml-auto text-slate-500" />
                </div>
            </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50 backdrop-blur-md z-10">
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
                <Menu size={24} />
            </button>
            <div className="flex flex-col">
                <h1 className="text-white font-semibold flex items-center gap-2">
                    n8n Mimari Asistanı
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono border border-emerald-500/20">ONLINE</span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">AWS • n8n • NotebookLM • Docker • PostgreSQL</p>
            </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 space-y-6 scroll-smooth">
          {chatState.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {chatState.isLoading && (
            <MessageBubble 
              message={{
                id: 'loading',
                role: 'model',
                content: '',
                timestamp: new Date(),
                isThinking: true
              }} 
            />
          )}
          
          {chatState.error && (
            <div className="flex justify-center">
                <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-500/20">
                    {chatState.error}
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Settings Area */}
        <div className="bg-slate-900 border-t border-slate-800">
            {/* Control Bar */}
            <div className="px-4 sm:px-6 pt-3 pb-1 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Seçenekler:</span>
                    
                    {/* Paid Tools Toggle */}
                    <button 
                        onClick={() => setAppSettings(prev => ({ ...prev, allowPaidTools: !prev.allowPaidTools }))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            appSettings.allowPaidTools 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                        title="OpenAI, Anthropic vb. ücretli API'leri önerilere dahil et"
                    >
                        <DollarSign size={14} />
                        {appSettings.allowPaidTools ? 'Ücretli Araçlar: Açık' : 'Ücretli Araçlar: Kapalı'}
                        {appSettings.allowPaidTools ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    </button>

                    {/* Output Format Toggle */}
                    <button 
                        onClick={() => setAppSettings(prev => ({ ...prev, outputFormat: prev.outputFormat === 'json' ? 'node' : 'json' }))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            appSettings.outputFormat === 'json'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                        title="n8n JSON çıktısı veya sadece Node açıklaması arasında geçiş yap"
                    >
                        {appSettings.outputFormat === 'json' ? <FileJson size={14} /> : <FileText size={14} />}
                        {appSettings.outputFormat === 'json' ? 'Çıktı: Tam JSON' : 'Çıktı: Node Anlatımı'}
                    </button>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Globe size={12} className="text-sky-500" />
                    <span>Hata araması aktif</span>
                </div>
            </div>

            {/* Input Box */}
            <div className="p-4 sm:p-6 pt-2">
                <div className="max-w-4xl mx-auto relative group">
                    <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Örn: Gelen müşteri e-postalarını AI Agent ile analiz edip otomatik yanıtla..."
                    className="w-full bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 pl-4 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 resize-none h-[60px] max-h-[200px] overflow-hidden transition-all shadow-xl"
                    style={{ minHeight: '60px' }}
                    />
                    <button
                    onClick={handleSend}
                    disabled={chatState.isLoading || !input.trim()}
                    className="absolute right-2 bottom-2.5 p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/20"
                    >
                    <Send size={18} />
                    </button>
                </div>
                <p className="text-center text-slate-600 text-[10px] mt-3 font-mono">
                    n8n Architect v1.2 • AI Agent Ready • Powered by Gemini 3 Pro
                </p>
            </div>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
