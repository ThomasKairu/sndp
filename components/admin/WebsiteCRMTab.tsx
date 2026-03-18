
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Globe, Loader2, AlertCircle, CheckCircle,
    Phone, User, ChevronDown, Flame, Search, Clock
} from 'lucide-react';
import {
    Lead, getLeads, updateLead, getConversationHistory,
    ConversationMessage, parseMessage, extractName
} from '../../services/dataService';

// ---- Helpers ----

function useToast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success', durationMs = 3000) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast({ message, type });
        timerRef.current = setTimeout(() => setToast(null), durationMs);
    }, []);
    return { toast, showToast };
}

function daysSince(iso?: string): number {
    if (!iso) return 0;
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
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

/**
 * Formats a website session ID for display.
 * Shows the real phone if it's a normal phone number, otherwise shows a truncated session ID.
 */
function formatWebsiteId(phone: string): string {
    // If it looks like a real phone number captured later
    if (/^\d{9,14}$/.test(phone.replace(/\D/g, '')) && phone.replace(/\D/g, '').length <= 13) {
        if (!phone.startsWith('sess_') && phone.length <= 15) return phone;
    }
    // Session ID — truncate for readability
    if (phone.startsWith('sess_')) return phone.substring(0, 18) + '…';
    if (phone.length > 20) return phone.substring(0, 16) + '…';
    return phone;
}

// ---- Status Badge ----
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(status)}`}>
        {status.toUpperCase()}
    </span>
);

// ---- Chat Bubble ----
const ChatBubble: React.FC<{ msg: ConversationMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    const isAssistant = msg.role === 'assistant';
    const hasHotBadge = isAssistant && msg.message?.includes('[ALERT_SALES]');

    const cleanText = (text: string) => text.replace(/\[ALERT_SALES\].*$/s, '').trim();

    const renderMarkdown = (text: string) =>
        text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/^[\*\-] (.+)$/gm, '• $1');

    const displayText = isAssistant ? cleanText(msg.message || '') : (msg.message || '');
    if (!displayText && isAssistant) return null;

    return (
        <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} mb-4`}>
            <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative shadow-sm ${
                isUser
                    ? 'bg-gray-100 text-slate-800 rounded-bl-none border border-gray-200'
                    : 'bg-brand-600 text-white rounded-br-none'
            }`}>
                {hasHotBadge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm border border-white z-10">
                        <Flame size={10} /> HOT
                    </span>
                )}
                <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(displayText) }}
                />
                <p className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-gray-400' : 'text-blue-100'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

// ---- Main Component ----

export const WebsiteCRMTab: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [conversation, setConversation] = useState<ConversationMessage[]>([]);
    const [convLoading, setConvLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast, showToast } = useToast();
    const threadRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when conversation updates
    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [conversation]);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const all = await getLeads();
            // Only website leads (non-WhatsApp phone format)
            const websiteLeads = all.filter(l => l.source === 'website');
            setLeads(websiteLeads);
        } catch (err) {
            console.error('Error fetching website leads:', err);
            showToast('Failed to load leads.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    useEffect(() => {
        if (!selectedLead) return;
        setConvLoading(true);
        setConversation([]);
        getConversationHistory(selectedLead.phone)
            .then((data: any[]) => {
                const flattened: ConversationMessage[] = [];
                data.forEach((log: any) => {
                    const rawMsg: string = log.message || '';
                    const rawResp: string = log.response || '';

                    // Customer message (left side)
                    if (rawMsg && !rawMsg.startsWith('[AGENT]')) {
                        flattened.push({
                            role: 'user',
                            message: parseMessage(rawMsg),
                            created_at: log.timestamp,
                        });
                    }

                    // Steve's AI response (right side in brand blue)
                    if (rawResp.trim() !== '') {
                        flattened.push({
                            role: 'assistant',
                            message: rawResp,
                            created_at: log.timestamp,
                        });
                    }
                });
                setConversation(flattened);
                setConvLoading(false);
            })
            .catch(() => {
                showToast('Failed to load conversation.', 'error');
                setConvLoading(false);
            });
    }, [selectedLead, showToast]);

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedLead) return;
        setUpdatingStatus(true);
        try {
            await updateLead(selectedLead.phone, { status: newStatus as any });
            setSelectedLead({ ...selectedLead, status: newStatus as any });
            setLeads(ls => ls.map(l => l.phone === selectedLead.phone ? { ...l, status: newStatus as any } : l));
            showToast('✅ Status updated', 'success');
        } catch (err: any) {
            showToast('Failed to update status.', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleMarkConverted = async () => {
        if (!selectedLead) return;
        setUpdatingStatus(true);
        try {
            await updateLead(selectedLead.phone, { status: 'converted' as any, converted: true });
            setSelectedLead({ ...selectedLead, status: 'converted' as any, converted: true });
            setLeads(ls => ls.map(l => l.phone === selectedLead.phone ? { ...l, status: 'converted' as any, converted: true } : l));
            showToast('✅ Marked as Converted', 'success');
        } catch {
            showToast('Failed to mark converted.', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Display identifier: use real phone if captured, else session ID (formatted)
    function getDisplayId(lead: Lead): string {
        const phone = lead.phone;
        // A real phone captured for this website lead (not a session ID)
        if (!phone.startsWith('sess_') && phone.length <= 15 && /^\d+$/.test(phone)) {
            return phone;
        }
        return formatWebsiteId(phone);
    }

    const filteredLeads = leads.filter(l =>
        (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] relative overflow-hidden md:overflow-visible bg-gray-50">
            {/* Left Panel — Website Leads List */}
            <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col ${selectedLead && 'hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Globe size={18} className="text-teal-600" />
                        <span>Website Leads</span>
                        <span className="ml-auto bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">{leads.length}</span>
                    </h3>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name or session ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 size={28} className="animate-spin text-teal-600" />
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center text-gray-400 p-8 text-sm">
                            No website leads found.
                        </div>
                    ) : (
                        filteredLeads.map(lead => {
                            const days = daysSince(lead.last_seen);
                            const displayName = lead.name || 'Website Visitor';
                            const displayId = getDisplayId(lead);
                            const isHot = lead.status === 'hot';

                            return (
                                <div
                                    key={lead.phone}
                                    onClick={() => setSelectedLead(lead)}
                                    className={`p-4 cursor-pointer transition flex items-center gap-3 ${
                                        selectedLead?.phone === lead.phone
                                            ? 'bg-teal-50 border-l-4 border-l-teal-600'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm bg-teal-600">
                                        <User size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <p className="font-bold text-slate-800 text-sm truncate">{displayName}</p>
                                            {isHot && <StatusBadge status="hot" />}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mb-1">
                                            {parseMessage(lead.last_message)}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <Clock size={9} />
                                            <span className={days >= 7 ? 'text-red-500 font-bold' : ''}>{days}d ago</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="font-mono truncate max-w-[100px]">{displayId}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Panel — Conversation Thread */}
            <div className={`flex-1 flex flex-col bg-slate-50 min-w-0 ${!selectedLead && 'hidden md:flex'}`}>
                {!selectedLead ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <div className="p-6 bg-white rounded-full shadow-sm">
                            <Globe size={48} className="opacity-20" />
                        </div>
                        <p className="font-medium text-sm">Select a website visitor to view their conversation</p>
                        <p className="text-xs text-gray-300">Website chatbot conversations appear here</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-gray-100 rounded-lg"
                                >
                                    <ChevronDown className="rotate-90" size={24} />
                                </button>
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm bg-teal-600">
                                    <User size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-800 truncate">
                                            {selectedLead.name || 'Website Visitor'}
                                        </p>
                                        <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                                            WEBSITE
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-mono truncate flex items-center gap-1">
                                        {/* Show real phone if captured, otherwise show session ID */}
                                        {getDisplayId(selectedLead) !== selectedLead.phone
                                            ? <><Phone size={9} className="flex-shrink-0" /> {getDisplayId(selectedLead)}</>
                                            : <span className="text-gray-400">{getDisplayId(selectedLead)}</span>
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <select
                                        value={selectedLead.status}
                                        onChange={e => handleStatusChange(e.target.value)}
                                        disabled={updatingStatus}
                                        className={`text-xs font-bold rounded-lg pl-3 pr-8 py-2 border-0 outline-none appearance-none cursor-pointer shadow-sm ${statusColor(selectedLead.status)}`}
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-2 pointer-events-none opacity-60" />
                                </div>
                                <button
                                    onClick={handleMarkConverted}
                                    className="hidden sm:flex items-center gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm"
                                >
                                    <CheckCircle size={14} /> Converted
                                </button>
                            </div>
                        </div>

                        {/* Bubble Legend */}
                        <div className="px-4 pt-2 pb-1 flex items-center gap-4 text-[11px] text-gray-400 border-b border-gray-100 bg-white">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" /> Visitor
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-brand-600 inline-block" /> Steve (AI)
                            </span>
                        </div>

                        {/* Conversation Thread */}
                        <div ref={threadRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1">
                            {convLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 size={32} className="animate-spin text-teal-600" />
                                </div>
                            ) : conversation.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-12 italic">
                                    No message history found for this visitor.
                                </div>
                            ) : (
                                conversation.map((msg, i) => <ChatBubble key={i} msg={msg} />)
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-2xl text-white text-sm font-bold flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />} {toast.message}
                </div>
            )}
        </div>
    );
};
