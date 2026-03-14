
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    MessageSquare, Loader2, AlertCircle, CheckCircle,
    ExternalLink, Send, Phone, User, ChevronDown, Flame
} from 'lucide-react';
import {
    Lead, getLeads, updateLead, getConversationHistory,
    sendManualFollowup, ConversationMessage, parseMessage
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

function formatWALink(phone: string) {
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('0') ? '254' + cleaned.slice(1) : cleaned.startsWith('254') ? cleaned : '254' + cleaned;
    return `https://wa.me/${normalized}`;
}

function initials(name: string) {
    if (!name) return '?';
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

/**
 * Determines the message type for rendering.
 * - 'user'   → customer (left side)
 * - 'agent'  → sales team manual message — message starts with [AGENT] (right side, dark blue)
 * - 'steve'  → AI assistant (right side, brand blue)
 */
type MsgType = 'user' | 'agent' | 'steve';

function getMsgType(msg: ConversationMessage): MsgType {
    if (msg.role === 'user') return 'user';
    if (msg.message?.startsWith('[AGENT]')) return 'agent';
    return 'steve';
}

/** Strip [AGENT] prefix for display. Customer never sees it. CRM strips it too. */
function stripAgentPrefix(text: string): string {
    return text.replace(/^\[AGENT\]\s*/, '').trim();
}

// ---- Helper Components ----

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(status)}`}>
        {status.toUpperCase()}
    </span>
);

const ChatBubble: React.FC<{ msg: ConversationMessage }> = ({ msg }) => {
    const msgType = getMsgType(msg);
    const isRight = msgType !== 'user';

    // Strip [ALERT_SALES] for Steve messages; strip [AGENT] prefix for agent messages
    const hasHotBadge = msgType === 'steve' && msg.message?.includes('[ALERT_SALES]');
    const rawText = msgType === 'agent'
        ? stripAgentPrefix(msg.message || '')
        : msg.message?.replace(/\[ALERT_SALES\].*$/s, '').trim() || '';

    // Styling
    const bubbleStyle = msgType === 'agent'
        ? 'bg-[#1a56a0] text-white rounded-br-none shadow-md'      // darker blue for sales team
        : msgType === 'steve'
            ? 'bg-brand-600 text-white rounded-br-none shadow-md'   // brand blue for Steve
            : 'bg-white text-slate-800 border border-gray-200 rounded-bl-none shadow-sm'; // left for customer

    return (
        <div className={`flex ${isRight ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${bubbleStyle}`}>
                {hasHotBadge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm border border-white">
                        <Flame size={10} /> HOT
                    </span>
                )}
                <div className="whitespace-pre-wrap">{rawText}</div>
                <p className={`text-[10px] mt-1 text-right ${isRight ? 'text-blue-100' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            {/* Label below bubble */}
            {msgType === 'agent' && (
                <div className="self-end ml-1.5 text-[10px] text-slate-400 font-medium pb-0.5">
                    🧑‍💼 Sales Team
                </div>
            )}
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
            setLeads(all);
        } catch (err) {
            console.error('Error fetching leads:', err);
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
        getConversationHistory(selectedLead.phone).then(data => {
            const flattened: ConversationMessage[] = [];
            (data as any[]).forEach((log: any) => {
                const rawMsg: string = log.message || '';
                const rawResp: string = log.response || '';

                // ── Agent-sent message rows ────────────────────────────────────
                // These rows have message = '[AGENT] ...' and response = ''.
                // They must appear on the RIGHT side (role: assistant) with the
                // agent bubble style — NOT on the customer side.
                if (rawMsg.startsWith('[AGENT]')) {
                    flattened.push({
                        role: 'assistant',
                        message: rawMsg,               // keep [AGENT] prefix — getMsgType() uses it
                        created_at: log.timestamp,
                    });
                    // response will be empty for agent rows — skip it
                    return;
                }

                // ── Normal customer message (left side) ───────────────────────
                if (rawMsg) {
                    flattened.push({
                        role: 'user',
                        message: parseMessage(rawMsg),
                        created_at: log.timestamp,
                    });
                }

                // ── Steve's response (right side, brand blue) ─────────────────
                // Skip empty responses to avoid blank bubbles
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
        }).catch(() => {
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
            console.error('[handleStatusChange]', err);
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
        } catch (err: any) {
            console.error('[handleMarkConverted]', err);
            showToast('Failed to mark converted.', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleSendFollowup = async () => {
        if (!selectedLead || !followupMessage.trim()) return;
        setSendingFollowup(true);
        const msgText = followupMessage.trim();

        try {
            await sendManualFollowup(selectedLead.phone, msgText);

            // ✅ Fix 3: Clear input immediately after successful send
            setFollowupMessage('');

            // ✅ Fix 3: Append agent message to conversation thread immediately (right side, dark blue)
            // Store with [AGENT] prefix so getMsgType correctly identifies it as an agent bubble
            setConversation(prev => [...prev, {
                role: 'assistant',
                message: `[AGENT] ${msgText}`,
                created_at: new Date().toISOString(),
            }]);

            // ✅ Fix 3 / Fix 6: Show green success toast for 2 seconds
            showToast('✅ Sent successfully', 'success', 2000);

        } catch (err: any) {
            // ✅ Fix 6: Show red error toast for 3 seconds, keep message in input for retry
            console.error('[handleSendFollowup] Failed to send:', err);
            showToast('❌ Failed to send. Please retry.', 'error', 3000);
            // Message stays in input — do NOT clear followupMessage
        } finally {
            setSendingFollowup(false);
        }
    };

    const filteredLeads = leads.filter(l =>
        (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] relative overflow-hidden md:overflow-visible bg-gray-50">
            {/* Left Panel - Leads List */}
            <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col ${selectedLead && 'hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <MessageSquare size={18} className="text-brand-600" /> All Leads
                        <span className="ml-auto bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">{leads.length}</span>
                    </h3>
                    <div className="relative">
                        <ChevronDown size={14} className="absolute left-3 top-3 text-gray-400 rotate-90" />
                        <input
                            type="text"
                            placeholder="Search name or phone..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 size={28} className="animate-spin text-brand-600" />
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center text-gray-400 p-8 text-sm">No leads found.</div>
                    ) : (
                        filteredLeads.map(lead => {
                            const isWhatsApp = lead.source === 'whatsapp';
                            const displayPhone = isWhatsApp ? lead.phone : (lead.phone.startsWith('sess_') || lead.phone.length > 15 ? 'Phone pending' : lead.phone);
                            const displayName = lead.name || (isWhatsApp ? "WhatsApp User" : "Website Visitor");

                            return (
                                <div
                                    key={lead.phone}
                                    onClick={() => setSelectedLead(lead)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition flex items-center gap-3 ${selectedLead?.phone === lead.phone ? 'bg-brand-50 border-l-4 border-l-brand-600' : 'hover:bg-gray-50'}`}
                                >
                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm ${isWhatsApp ? 'bg-green-600' : 'bg-brand-600'}`}>
                                        {isWhatsApp ? initials(displayName) : <User size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <p className="font-bold text-slate-800 text-sm truncate">{displayName}</p>
                                            {lead.status === 'hot' && <StatusBadge status="hot" />}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="truncate flex items-center gap-1">
                                                {isWhatsApp ? '📱' : '🌐'} {displayPhone}
                                            </span>
                                            <span className="flex-shrink-0">{daysSince(lead.last_seen)}d ago</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Panel - Conversation */}
            <div className={`flex-1 flex flex-col bg-slate-50 min-w-0 ${!selectedLead && 'hidden md:flex'}`}>
                {!selectedLead ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <div className="p-6 bg-white rounded-full shadow-sm">
                            <MessageSquare size={48} className="opacity-20" />
                        </div>
                        <p className="font-medium">Select a lead to view conversation history</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedLead(null)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-gray-100 rounded-lg">
                                    <ChevronDown className="rotate-90" size={24} />
                                </button>
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${selectedLead.source === 'whatsapp' ? 'bg-green-600' : 'bg-brand-600'}`}>
                                    {selectedLead.source === 'whatsapp' ? initials(selectedLead.name || '') : <User size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{selectedLead.name || "Website Visitor"}</p>
                                    <p className="text-xs text-gray-400 font-medium truncate flex items-center gap-1">
                                        {selectedLead.source === 'whatsapp' ? <><Phone size={10} /> {selectedLead.phone}</> : 'Website Session'}
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
                                    className="hidden sm:flex items-center gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm"
                                >
                                    <CheckCircle size={14} /> Converted
                                </button>
                                {selectedLead.source === 'whatsapp' && (
                                    <a href={formatWALink(selectedLead.phone)} target="_blank" rel="noopener noreferrer"
                                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition shadow-sm">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Bubble legend */}
                        <div className="px-4 pt-2 pb-1 flex items-center gap-4 text-[11px] text-gray-400 border-b border-gray-100 bg-white">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" /> Customer
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-brand-600 inline-block" /> Steve (AI)
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#1a56a0' }} /> Sales Team
                            </span>
                        </div>

                        {/* Thread */}
                        <div ref={threadRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1">
                            {convLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 size={32} className="animate-spin text-brand-600" />
                                </div>
                            ) : conversation.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-12 italic">No message history found.</div>
                            ) : (
                                conversation.map((msg, i) => <ChatBubble key={i} msg={msg} />)
                            )}
                        </div>

                        {/* Footer - Send Followup */}
                        <div className="bg-white border-t border-gray-100 p-4">
                            <div className="max-w-4xl mx-auto flex gap-3">
                                <textarea
                                    value={followupMessage}
                                    onChange={e => setFollowupMessage(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                            e.preventDefault();
                                            handleSendFollowup();
                                        }
                                    }}
                                    placeholder="Type a manual follow-up message... (Ctrl+Enter to send)"
                                    rows={2}
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-inner bg-gray-50/50"
                                />
                                <button
                                    onClick={handleSendFollowup}
                                    disabled={sendingFollowup || !followupMessage.trim()}
                                    className="px-6 rounded-xl font-bold text-sm flex items-center justify-center min-w-[100px] transition-all disabled:opacity-50 shadow-md bg-[#1a56a0] hover:bg-[#154490] text-white"
                                >
                                    {sendingFollowup ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} className="mr-1.5" /> Send</>}
                                </button>
                            </div>
                            <p className="text-center text-[11px] text-gray-400 mt-1.5">
                                🧑‍💼 Messages sent here go directly to the customer. Steve will see them in history.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Toast Notifications */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-2xl text-white text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />} {toast.message}
                </div>
            )}
        </div>
    );
};
