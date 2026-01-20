import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, CheckCircle } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Jambo! Welcome to Provision Land. How can I help you find your dream property today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, leadCaptured]);

  const handleLeadDetected = (details: {phoneNumber: string, customerName?: string, inquirySummary: string}) => {
    // Simulate sending logic
    console.log("--------------- LEAD CAPTURED ---------------");
    console.log("To: sales@provisionlands.co.ke");
    console.log("Subject: NEW LEAD - Website Chatbot");
    console.log(`Customer: ${details.customerName || 'Anonymous'}`);
    console.log(`Phone: ${details.phoneNumber}`);
    console.log(`Summary: ${details.inquirySummary}`);
    console.log("---------------------------------------------");
    
    setLeadCaptured(true);
    setTimeout(() => setLeadCaptured(false), 5000); // Hide notification after 5s
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getChatResponse(userMsg, messages, handleLeadDetected);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // Helper to render links
  const renderMessage = (text: string, role: 'user' | 'model') => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`underline break-all ${role === 'user' ? 'text-white font-bold hover:text-brand-100' : 'text-brand-600 hover:text-brand-800'}`}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Lead Captured Toast */}
      {leadCaptured && (
         <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up">
            <CheckCircle size={20} />
            <div>
              <p className="font-bold text-sm">Details Sent to Sales Team!</p>
              <p className="text-xs text-green-100">They will contact you shortly.</p>
            </div>
         </div>
      )}

      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] transition-all duration-300 ease-in-out animate-fade-in-up">
          <div className="bg-brand-800 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-serif font-bold">Provision Assistant</h3>
                <p className="text-xs text-brand-200">Online | AI Powered</p>
              </div>
            </div>
            <button onClick={toggleChat} className="hover:bg-brand-700 p-1 rounded-full transition">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                }`}>
                  {renderMessage(msg.text, msg.role)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200 rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                  <span className="text-xs text-gray-500">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about plots, prices..."
                className="flex-1 p-2 bg-brand-600 text-white placeholder:text-brand-200 border border-brand-500 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-brand-800 text-white rounded-full hover:bg-brand-900 transition disabled:opacity-50 shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={toggleChat}
        className={`${isOpen ? 'hidden' : 'flex'} items-center justify-center w-14 h-14 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-brand-300`}
        aria-label="Open Chat"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default ChatWidget;