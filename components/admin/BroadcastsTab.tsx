import React, { useState, useEffect, useCallback } from 'react';
import {
    Radio, Send, Loader2, AlertCircle, CheckCircle,
    ChevronDown, Users
} from 'lucide-react';
import {
    sendInventoryBroadcast, getBroadcastHistory, getLeadsCount,
    BroadcastPayload, BroadcastRecord
} from '../../services/dataService';

const PROPERTIES_LIST = [
    'Matuu Kivandini', 'Sagana Makutano', 'Tola Ngoingwa', 'Kiharu',
    "Mang'u", 'Ithanga', 'Kilimambogo', 'Muguga Gatuanyaga',
    'Makuyu Mananja', 'Athena Thika', 'Thika Town Commercial', 'Mwingi'
];

const PROPERTY_PRICES: Record<string, number> = {
    'Matuu Kivandini': 280000, 'Sagana Makutano': 650000, 'Tola Ngoingwa': 2300000,
    'Kiharu': 1800000, "Mang'u": 5000000, 'Ithanga': 650000, 'Kilimambogo': 650000,
    'Muguga Gatuanyaga': 1800000, 'Makuyu Mananja': 2600000, 'Athena Thika': 2500000,
    'Thika Town Commercial': 7500000, 'Mwingi': 200000
};

// ---- Toast Hook ----
function useToast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);
    return { toast, showToast };
}

function formatKES(n: number) {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);
}

function statusBadge(status: string) {
    const m: Record<string, string> = { sent: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-600', pending: 'bg-yellow-100 text-yellow-700' };
    return m[status.toLowerCase()] || 'bg-gray-100 text-gray-600';
}

// ---- Confirmation Modal ----
const ConfirmModal = ({ data, reachCount, onConfirm, onClose, sending }: {
    data: BroadcastPayload; reachCount: number;
    onConfirm: () => void; onClose: () => void; sending: boolean;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-slate-800 p-5 rounded-t-2xl">
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><Radio size={20} /> Confirm Broadcast</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                    <Users size={20} className="text-blue-600 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-blue-800 text-lg">{reachCount} leads</p>
                        <p className="text-xs text-blue-600">will receive this broadcast</p>
                    </div>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">Property</span><span className="font-semibold text-slate-700">{data.property_name}</span></div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">Price</span><span className="font-semibold text-slate-700">{data.price}</span></div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">Location</span><span className="font-semibold text-slate-700">{data.location}</span></div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">Highlight</span><span className="font-semibold text-slate-700 text-right max-w-[60%]">{data.key_highlight}</span></div>
                    <div className="flex justify-between py-1.5"><span className="text-gray-500">Budget Range</span><span className="font-semibold text-slate-700">{formatKES(data.budget_min)} – {formatKES(data.budget_max)}</span></div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg transition text-sm">Cancel</button>
                    <button onClick={onConfirm} disabled={sending} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send Now
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ---- Main Component ----
export const BroadcastsTab: React.FC = () => {
    const [form, setForm] = useState<BroadcastPayload>({
        property_name: '', location: '', price: '', key_highlight: '',
        budget_min: 0, budget_max: 0
    });
    const [reachCount, setReachCount] = useState<number | null>(null);
    const [fetchingCount, setFetchingCount] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<BroadcastRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const { toast, showToast } = useToast();

    // Auto-fill price when property selected
    useEffect(() => {
        if (form.property_name && PROPERTY_PRICES[form.property_name]) {
            const price = PROPERTY_PRICES[form.property_name];
            setForm(f => ({ ...f, price: formatKES(price) }));
        }
    }, [form.property_name]);

    // Fetch history on mount
    useEffect(() => {
        setHistoryLoading(true);
        getBroadcastHistory().then(data => { setHistory(data); setHistoryLoading(false); });
    }, []);

    const handleFetchCount = async () => {
        if (!form.budget_min || !form.budget_max) return;
        setFetchingCount(true);
        const count = await getLeadsCount(form.budget_min, form.budget_max);
        setReachCount(count);
        setFetchingCount(false);
    };

    const handlePrepare = async () => {
        if (!form.property_name || !form.location || !form.price || !form.key_highlight) {
            showToast('Please fill all required fields.', 'error');
            return;
        }
        await handleFetchCount();
        setShowConfirm(true);
    };

    const handleSend = async () => {
        setSending(true);
        try {
            await sendInventoryBroadcast(form);
            showToast('Broadcast sent successfully!', 'success');
            setShowConfirm(false);
            setForm({ property_name: '', location: '', price: '', key_highlight: '', budget_min: 0, budget_max: 0 });
            // Refresh history
            const updated = await getBroadcastHistory();
            setHistory(updated);
        } catch (err: any) {
            showToast(err.message || 'Failed to send broadcast.', 'error');
        } finally {
            setSending(false);
        }
    };

    const setF = (key: keyof BroadcastPayload, val: string | number) => setForm(f => ({ ...f, [key]: val }));

    return (
        <div className="p-6 md:p-8 max-w-5xl relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-100 rounded-lg"><Radio size={22} className="text-brand-700" /></div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Inventory Broadcast</h2>
                    <p className="text-sm text-gray-500">Send targeted WhatsApp messages to leads within a budget range</p>
                </div>
            </div>

            {/* Broadcast Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">New Broadcast</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Property Name *</label>
                        <div className="relative">
                            <select
                                value={form.property_name}
                                onChange={e => setF('property_name', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-white"
                            >
                                <option value="">-- Select property --</option>
                                {PROPERTIES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 pointer-events-none text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Location *</label>
                        <input
                            value={form.location}
                            onChange={e => setF('location', e.target.value)}
                            placeholder="e.g. Thika Road, Nairobi"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Price (KES) *</label>
                        <input
                            value={form.price}
                            onChange={e => setF('price', e.target.value)}
                            placeholder="Auto-filled from property"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Key Highlight *</label>
                        <input
                            value={form.key_highlight}
                            onChange={e => setF('key_highlight', e.target.value)}
                            placeholder="e.g. Ready title deed, near tarmac"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Target Budget Min (KES)</label>
                        <input
                            type="number"
                            value={form.budget_min || ''}
                            onChange={e => setF('budget_min', Number(e.target.value))}
                            placeholder="e.g. 100000"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Target Budget Max (KES)</label>
                        <input
                            type="number"
                            value={form.budget_max || ''}
                            onChange={e => setF('budget_max', Number(e.target.value))}
                            placeholder="e.g. 500000"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-5">
                    {reachCount !== null && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg">
                            <Users size={15} /> <b>{reachCount} leads</b> in this budget range
                        </div>
                    )}
                    <div className="ml-auto flex gap-3">
                        <button
                            onClick={handleFetchCount}
                            disabled={fetchingCount || !form.budget_min || !form.budget_max}
                            className="text-sm border border-brand-300 text-brand-700 hover:bg-brand-50 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {fetchingCount ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />} Check Reach
                        </button>
                        <button
                            onClick={handlePrepare}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition shadow-md hover:shadow-lg"
                        >
                            <Send size={15} /> Send Broadcast
                        </button>
                    </div>
                </div>
            </div>

            {/* Broadcast History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Broadcast History</h3>
                </div>
                {historyLoading ? (
                    <div className="flex justify-center items-center h-24 text-brand-600">
                        <Loader2 size={28} className="animate-spin" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-sm">No broadcasts sent yet.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-3">Property</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Sent To</th>
                                <th className="px-6 py-3">Date Sent</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.map(rec => (
                                <tr key={rec.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 font-medium text-slate-800">{rec.property_name}</td>
                                    <td className="px-6 py-3 text-gray-600">{rec.price}</td>
                                    <td className="px-6 py-3">
                                        <span className="flex items-center gap-1"><Users size={13} className="text-gray-400" /> {rec.sent_to}</span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{new Date(rec.date_sent).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(rec.status)}`}>{rec.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showConfirm && (
                <ConfirmModal
                    data={form}
                    reachCount={reachCount ?? 0}
                    onConfirm={handleSend}
                    onClose={() => setShowConfirm(false)}
                    sending={sending}
                />
            )}

            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {toast.message}
                </div>
            )}
        </div>
    );
};
