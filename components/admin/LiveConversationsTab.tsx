
import React, { useState, useEffect, useCallback } from 'react';
import {
    MessageSquare, Loader2, AlertCircle, CheckCircle,
    User, Search, Clock, Flame
} from 'lucide-react';
import {
    Lead, getLeads, getConversationHistory,
    ConversationMessage, parseMessage, extractName
} from '../../services/dataService';

// ---- Helpers ----
function daysSince(iso?: string): number {
    if (!iso) return 0;
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function initials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('');
}

// ---- Chat Bubble ----
const ChatBubble: React.FC<{ msg: ConversationMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    const isAssistant = msg.role === 'assistant';
    const hasHotBadge = isAssistant && msg.message?.includes('[ALERT_SALES]');
    
    const cleanResponse = (text: string) => {
        return text.replace(/\[ALERT_SALES\].*$/s, '').trim();
    };

    const renderMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/^[\*\-] (.+)$/gm, '• $1');
    };

    const displayMsg = isAssistant ? cleanResponse(msg.message) : msg.message;

    if (!displayMsg && isAssistant) return null;

    return (
        <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} mb-4 relative`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${isUser ? 'bg-gray-100 text-slate-800 rounded-bl-sm' : 'bg-green-600 text-white rounded-br-sm'}`}>
                {hasHotBadge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm z-10">
                        <Flame size={10} /> HOT
                    </span>
                )}
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(displayMsg) }} />
                <p className={`text-[10px] mt-1 ${isUser ? 'text-gray-400' : 'text-green-100'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

// ---- Main Component ----
export const LiveConversationsTab: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [conversation, setConversation] = useState<ConversationMessage[]>([]);
    const [convLoading, setConvLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const data = await getLeads();
            setLeads(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    useEffect(() => {
        if (!selectedLead) return;
        setConvLoading(true);
        getConversationHistory(selectedLead.phone).then(data => {
            // Map lead_logs to ConversationMessage
            // lead_logs has message (user) and response (assistant)
            // We need to flatten them into individual bubbles
            const flattened: ConversationMessage[] = [];
            data.forEach((log: any) => {
                if (log.message) {
                    flattened.push({
                        role: 'user',
                        message: parseMessage(log.message),
                        created_at: log.timestamp
                    });
                }
                if (log.response) {
                    flattened.push({
                        role: 'assistant',
                        message: log.response,
                        created_at: log.timestamp
                    });
                }
            });
            setConversation(flattened);
            setConvLoading(false);
        });
    }, [selectedLead]);

    const filteredLeads = leads.filter(l =>
        (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] relative overflow-hidden md:overflow-visible">
            {/* Left Panel */}
            <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col ${selectedLead && 'hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg">
                        <MessageSquare size={20} className="text-brand-600" /> Live Chats
                        <span className="ml-auto bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">{leads.length}</span>
                    </h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 size={28} className="animate-spin text-brand-600" />
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center text-gray-400 p-12 text-sm">No conversations found.</div>
                    ) : (
                        filteredLeads.map(lead => {
                            const days = daysSince(lead.last_seen);
                            const isHot = lead.status === 'hot';
                            const isWhatsApp = lead.source === 'whatsapp';
                            const displayName = lead.name || (isWhatsApp ? "WhatsApp User" : "Website Visitor");
                            const displayPhone = isWhatsApp ? lead.phone : (lead.phone.startsWith('sess_') || lead.phone.length > 15 ? 'Phone pending' : lead.phone);

                            return (
                                <button
                                    key={lead.phone}
                                    onClick={() => setSelectedLead(lead)}
                                    className={`w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-gray-50 transition relative ${selectedLead?.phone === lead.phone ? 'bg-brand-50/50 border-r-4 border-r-brand-600' : ''}`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm ${isWhatsApp ? 'bg-green-600' : 'bg-brand-600'}`}>
                                        {displayName === "Website Visitor" ? <User size={20} /> : initials(displayName || lead.phone)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="font-bold text-slate-800 text-sm truncate">{displayName}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWhatsApp ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {isWhatsApp ? 'WhatsApp' : 'Website'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 truncate mb-1">{parseMessage(lead.last_message)}</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] flex items-center gap-1 ${days >= 7 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                <Clock size={10} /> {days}d silent
                                            </span>
                                            {isHot && (
                                                <span className="text-[10px] flex items-center gap-0.5 text-red-600 font-bold bg-red-50 px-1.5 rounded">
                                                    <Flame size={10} /> HOT
                                                </span>
                                            )}
                                            <span className="text-[10px] flex items-center gap-1 text-gray-400 bg-gray-50 px-1.5 rounded font-medium">
                                                {displayPhone}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className={`flex-1 flex flex-col bg-slate-50 min-w-0 ${!selectedLead && 'hidden md:flex'}`}>
                {!selectedLead ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <div className="p-6 bg-white rounded-full shadow-sm">
                            <MessageSquare size={48} className="opacity-20" />
                        </div>
                        <p className="text-sm font-medium">Select a contact to view the thread</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedLead(null)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-gray-100 rounded-lg">
                                    <AlertCircle className="rotate-90" />
                                </button>
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${selectedLead.source === 'whatsapp' ? 'bg-green-600' : 'bg-brand-600'}`}>
                                    {selectedLead.source === 'whatsapp' ? initials(selectedLead.name || '') : <User size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{selectedLead.name || (selectedLead.source === 'whatsapp' ? 'WhatsApp User' : 'Website Visitor')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{selectedLead.source === 'whatsapp' ? selectedLead.phone : (selectedLead.phone.startsWith('sess_') || selectedLead.phone.length > 15 ? 'Phone pending' : selectedLead.phone)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedLead.status === 'hot' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {selectedLead.status?.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Thread */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {convLoading ? (
                                <div className="flex justify-center items-center h-20">
                                    <Loader2 size={32} className="animate-spin text-brand-600" />
                                </div>
                            ) : conversation.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-12">No messages yet.</div>
                            ) : (
                                conversation.map((msg, i) => <ChatBubble key={i} msg={msg} />)
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
