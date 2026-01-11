import React, { useMemo } from 'react';
import { Message } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Simple markdown parser for code blocks and basic headers
  const formattedContent = useMemo(() => {
    const parts = message.content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Extract language and code
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : '';
        const code = match ? match[2] : part.replace(/```/g, '');
        
        return <CodeBlock key={index} language={language} code={code} />;
      }
      
      // Handle bold text and headers roughly
      const paragraphs = part.split('\n').map((line, lineIndex) => {
        if (!line.trim()) return <br key={lineIndex} />;
        
        // Headers
        if (line.startsWith('### ')) {
            return <h3 key={lineIndex} className="text-lg font-bold text-sky-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
             // Simple bold line check
             return <p key={lineIndex} className="font-bold mb-1">{line.replace(/\*\*/g, '')}</p>
        }

        // Basic bold parsing inline
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <p key={lineIndex} className="mb-2 leading-relaxed text-slate-300">
                {parts.map((p, i) => 
                    p.startsWith('**') && p.endsWith('**') 
                    ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong> 
                    : p
                )}
            </p>
        );
      });

      return <div key={index}>{paragraphs}</div>;
    });
  }, [message.content]);

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-4xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-rose-600'} shadow-lg`}>
          {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex-1 overflow-hidden rounded-2xl p-6 shadow-md ${
          isUser 
            ? 'bg-indigo-900/40 border border-indigo-500/30 text-indigo-50' 
            : 'bg-slate-800/80 border border-slate-700 text-slate-200'
        }`}>
          <div className="prose prose-invert max-w-none">
            {message.isThinking ? (
               <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 <span className="text-sm font-medium">Analiz yapılıyor...</span>
               </div>
            ) : (
              formattedContent
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-end">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-700 bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 uppercase">{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-emerald-300 whitespace-pre">{code}</code>
      </div>
    </div>
  );
};
