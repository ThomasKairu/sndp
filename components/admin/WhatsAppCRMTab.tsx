import React, { useState, useEffect, useCallback } from 'react';
import {
    MessageSquare, Loader2, AlertCircle, CheckCircle,
    ExternalLink, Send, Phone, User, ChevronDown
} from 'lucide-react';
import {
    Lead, getLeads, updateLead, getConversationHistory,
    sendManualFollowup, ConversationMessage, parseMessage
} from '../../services/dataService';

// ---- Toast Hook ----
function useToast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);
    return { toast, showToast };
}

// ---- Helpers ----
function daysSince(iso?: string): number {
    if (!iso) return 0;
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}
function formatWALink(phone: string) {
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('0') ? '254' + cleaned.slice(1) : cleaned.startsWith('254') ? cleaned : '254' + cleaned;
    return `https://wa.me/${normalized}`;
}
function initials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('');
}
function statusColor(status: string) {
    const m: Record<string, string> = {
        hot: 'bg-red-100 text-red-700', warm: 'bg-orange-100 text-orange-700',
        converted: 'bg-green-100 text-green-700', NEW: 'bg-blue-100 text-blue-700',
        CLOSED: 'bg-green-100 text-green-700', cold: 'bg-gray-100 text-gray-500',
    };
    return m[status] || 'bg-gray-100 text-gray-500';
}
const STATUS_OPTIONS = ['NEW', 'warm', 'hot', 'converted', 'cold', 'CLOSED'];

// ---- Lead List Item ----
const LeadItem = ({ lead, selected, onClick }: { lead: Lead; selected: boolean; onClick: () => void }) => {
    const days = daysSince(lead.last_seen);
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-100 hover:bg-brand-50 transition ${selected ? 'bg-brand-50 border-l-4 border-l-brand-500' : ''}`}
        >
            <div className="h-10 w-10 rounded-xl bg-brand-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                {initials(lead.name || lead.phone)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-800 text-sm truncate">{lead.name || lead.phone}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${statusColor(lead.status)}`}>{lead.status?.toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{parseMessage(lead.last_message)}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium ${days >= 7 ? 'text-red-600' : 'text-gray-400'}`}>
                        {days}d silent
                    </span>
                    {lead.status === 'hot' && <span className="bg-red-50 text-red-600 text-[9px] font-bold px-1 rounded flex items-center gap-0.5">🔥 HOT</span>}
                </div>
            </div>
        </button>
    );
};

// ---- Chat Bubble ----
const ChatBubble: React.FC<{ msg: ConversationMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} mb-3`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-gray-100 text-slate-800 rounded-bl-sm' : 'bg-green-600 text-white rounded-br-sm'}`}>
                <p>{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isUser ? 'text-gray-400' : 'text-green-100'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

// ---- Main Component ----
export const WhatsAppCRMTab: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [conversation, setConversation] = useState<ConversationMessage[]>([]);
    const [convLoading, setConvLoading] = useState(false);
    const [followupMessage, setFollowupMessage] = useState('');
    const [sendingFollowup, setSendingFollowup] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast, showToast } = useToast();

    // Fetch WhatsApp leads
    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const all = await getLeads();
            // Filter: must match 254... pattern and not be undefined/anon_web
            const data = all.filter(l => /^254\d{9}$/.test(l.phone));
            setLeads(data);
        } catch (err) {
            console.error('Error fetching leaks:', err);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    // Fetch conversation when lead selected
    useEffect(() => {
        if (!selectedLead) return;
        setConvLoading(true);
        setConversation([]);
        getConversationHistory(selectedLead.phone).then(data => {
            const flattened: ConversationMessage[] = [];
            data.forEach((log: any) => {
                if (log.message) flattened.push({ role: 'user', message: log.message, created_at: log.timestamp });
                if (log.response) flattened.push({ role: 'assistant', message: log.response, created_at: log.timestamp });
            });
            setConversation(flattened);
            setConvLoading(false);
        });
    }, [selectedLead]);

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedLead) return;
        setUpdatingStatus(true);
        try {
            await updateLead(selectedLead.phone, { status: newStatus as any });
            setSelectedLead({ ...selectedLead, status: newStatus as any });
            setLeads(ls => ls.map(l => l.phone === selectedLead.phone ? { ...l, status: newStatus as any } : l));
            showToast('Status updated!', 'success');
        } catch {
            showToast('Failed to update status.', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleMarkConverted = async () => {
        if (!selectedLead) return;
        await handleStatusChange('converted');
    };

    const handleSendFollowup = async () => {
        if (!selectedLead || !followupMessage.trim()) return;
        setSendingFollowup(true);
        try {
            await sendManualFollowup(selectedLead.phone, followupMessage.trim());
            showToast('Follow-up sent!', 'success');
            setFollowupMessage('');
        } catch {
            showToast('Failed to send follow-up.', 'error');
        } finally {
            setSendingFollowup(false);
        }
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] relative overflow-hidden md:overflow-visible">
            {/* Left Panel */}
            <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col ${selectedLead && 'hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <MessageSquare size={18} className="text-brand-600" /> WhatsApp Leads
                        <span className="ml-auto bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">{leads.length}</span>
                    </h3>
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-32 text-brand-600">
                            <Loader2 size={28} className="animate-spin" />
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center text-gray-400 p-8 text-sm">No WhatsApp leads found.</div>
                    ) : (
                        filteredLeads.map(lead => (
                            <React.Fragment key={lead.id}>
                                <LeadItem
                                    lead={lead}
                                    selected={selectedLead?.phone === lead.phone}
                                    onClick={() => setSelectedLead(lead)}
                                />
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className={`flex-1 flex flex-col bg-gray-50 min-w-0 ${!selectedLead && 'hidden md:flex'}`}>
                {!selectedLead ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                        <MessageSquare size={48} className="opacity-30" />
                        <p className="text-sm">Select a lead to view conversation</p>
                    </div>
                ) : (
                    <>
                        {/* Lead Header */}
                        <div className="bg-white border-b border-gray-200 p-3 md:p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Back button for mobile */}
                                <button 
                                    onClick={() => setSelectedLead(null)}
                                    className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    <ChevronDown className="rotate-90" size={20} />
                                </button>
                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-brand-700 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md">
                                    {initials(selectedLead.name || selectedLead.phone)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm md:text-base">{selectedLead.name}</p>
                                    <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                                        <Phone size={9} /> {selectedLead.phone}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                {/* Status dropdown */}
                                <div className="relative">
                                    <select
                                        value={selectedLead.status}
                                        onChange={e => handleStatusChange(e.target.value)}
                                        disabled={updatingStatus}
                                        className={`text-[10px] md:text-xs font-bold rounded-full pl-2 pr-6 md:pl-3 md:pr-7 py-1 md:py-1.5 border-0 outline-none appearance-none cursor-pointer ${statusColor(selectedLead.status)}`}
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown size={10} className="absolute right-1.5 md:right-2 top-1.5 md:top-2 pointer-events-none opacity-60" />
                                </div>
                                <a href={formatWALink(selectedLead.phone)} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[10px] md:text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg font-medium transition">
                                    <ExternalLink size={11} className="hidden sm:block" /> WA
                                </a>
                                <button
                                    onClick={handleMarkConverted}
                                    className="hidden sm:flex items-center gap-1 text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                                >
                                    <CheckCircle size={12} /> Converted
                                </button>
                            </div>
                        </div>

                        {/* Lead Info Bar */}
                        <div className="bg-white border-b border-gray-100 px-4 py-2 flex flex-wrap gap-x-6 gap-y-1 text-[10px] md:text-xs text-gray-500">
                            <span><b className="text-slate-700">Days silent:</b> {daysSince(selectedLead.last_seen)}d</span>
                            <span className="truncate flex-1 min-w-full sm:min-w-0"><b className="text-slate-700">Last seen:</b> {new Date(selectedLead.last_seen).toLocaleString()}</span>
                        </div>

                        {/* Conversation */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {convLoading ? (
                                <div className="flex justify-center items-center h-20 text-brand-600">
                                    <Loader2 size={24} className="animate-spin" />
                                </div>
                            ) : conversation.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-12">No conversation history.</div>
                            ) : (
                                conversation.map((msg, i) => <React.Fragment key={i}><ChatBubble msg={msg} /></React.Fragment>)
                            )}
                        </div>

                        {/* Send Follow-up */}
                        <div className="bg-white border-t border-gray-200 p-4 space-y-2">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Send Manual Follow-up</p>
                            <div className="flex gap-2">
                                <textarea
                                    value={followupMessage}
                                    onChange={e => setFollowupMessage(e.target.value)}
                                    placeholder="Type a custom message..."
                                    rows={2}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <button
                                    onClick={handleSendFollowup}
                                    disabled={sendingFollowup || !followupMessage.trim()}
                                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 rounded-lg font-medium text-sm flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingFollowup ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {toast.message}
                </div>
            )}
        </div>
    );
};
