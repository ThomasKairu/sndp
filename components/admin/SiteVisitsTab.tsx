import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar, CheckCircle, XCircle, Plus, Loader2, Clock,
    User, MapPin, MessageSquare, Bell, AlertCircle
} from 'lucide-react';
import { getSiteVisits, createSiteVisit, updateSiteVisit, SiteVisit } from '../../services/dataService';

const PROPERTIES_LIST = [
    'Matuu Kivandini', 'Sagana Makutano', 'Tola Ngoingwa', 'Kiharu',
    "Mang'u", 'Ithanga', 'Kilimambogo', 'Muguga Gatuanyaga',
    'Makuyu Mananja', 'Athena Thika', 'Thika Town Commercial', 'Mwingi'
];

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
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}
function isToday(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
function isThisWeek(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return d >= weekStart && d <= weekEnd;
}
function formatWALink(phone: string) {
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('0') ? '254' + cleaned.slice(1) : cleaned.startsWith('254') ? cleaned : '254' + cleaned;
    return `https://wa.me/${normalized}`;
}

// ---- Visit Card ----
const VisitCard = ({ visit, onMarkComplete, onCancel }: {
    visit: SiteVisit;
    onMarkComplete: (id: number) => void;
    onCancel: (id: number) => void;
}) => {
    const isPast = new Date(visit.visit_date) < new Date() && visit.status !== 'completed';
    const isCancelled = visit.status === 'cancelled';
    const isCompleted = visit.status === 'completed';

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-4 mb-3 transition hover:shadow-md ${isCancelled ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                        {visit.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">{visit.customer_name}</p>
                        <a href={formatWALink(visit.sender_id)} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                            <MessageSquare size={10} /> {visit.sender_id}
                        </a>
                    </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : isCancelled ? 'bg-gray-100 text-gray-500' : isPast ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
                    {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : isPast ? 'Overdue' : 'Scheduled'}
                </span>
            </div>
            <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin size={12} className="text-brand-500 flex-shrink-0" />
                    <span className="font-medium">{visit.property_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock size={12} className="text-brand-500 flex-shrink-0" />
                    <span>{formatDate(visit.visit_date)} at {formatTime(visit.visit_date)}</span>
                </div>
            </div>
            {/* Reminder badges */}
            <div className="flex gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${visit.reminder_24hr_sent ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    <Bell size={9} /> 24hr {visit.reminder_24hr_sent ? '✅' : '⏳'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${visit.reminder_morning_sent ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    <Bell size={9} /> Morning {visit.reminder_morning_sent ? '✅' : '⏳'}
                </span>
            </div>
            {/* Actions */}
            {!isCompleted && !isCancelled && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onMarkComplete(visit.id)}
                        className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg font-medium flex items-center justify-center gap-1 transition"
                    >
                        <CheckCircle size={13} /> Complete
                    </button>
                    <button
                        onClick={() => onCancel(visit.id)}
                        className="flex-1 text-xs bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1 transition"
                    >
                        <XCircle size={13} /> Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

// ---- Schedule Modal ----
const ScheduleModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: Partial<SiteVisit>) => void }) => {
    const [form, setForm] = useState({ customer_name: '', sender_id: '', property_name: '', date: '', time: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customer_name || !form.sender_id || !form.property_name || !form.date || !form.time) return;
        setSubmitting(true);
        const iso = new Date(`${form.date}T${form.time}`).toISOString();
        await onSubmit({ customer_name: form.customer_name, sender_id: form.sender_id, property_name: form.property_name, visit_date: iso, visit_day: form.date, status: 'scheduled' });
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="bg-brand-600 p-5 rounded-t-2xl flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">Schedule a Site Visit</h3>
                    <button onClick={onClose} className="text-brand-200 hover:text-white transition text-xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Customer Name</label>
                        <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required placeholder="Full name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Phone Number</label>
                        <input value={form.sender_id} onChange={e => setForm(f => ({ ...f, sender_id: e.target.value }))} required placeholder="07xxxxxxxx" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Property</label>
                        <select value={form.property_name} onChange={e => setForm(f => ({ ...f, property_name: e.target.value }))} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                            <option value="">-- Select property --</option>
                            {PROPERTIES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Date</label>
                            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Time</label>
                            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Scheduling...</> : 'Schedule Visit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ---- Column ----
const Column = ({ title, color, visits, onMarkComplete, onCancel, emptyMsg }: {
    title: string; color: string; visits: SiteVisit[];
    onMarkComplete: (id: number) => void; onCancel: (id: number) => void; emptyMsg: string;
}) => (
    <div className="flex-1 min-w-0">
        <div className={`flex items-center justify-between mb-4 px-1`}>
            <h3 className={`font-bold text-base ${color}`}>{title}</h3>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{visits.length}</span>
        </div>
        {visits.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm bg-gray-50 rounded-xl border-2 border-dashed">
                {emptyMsg}
            </div>
        ) : (
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1 space-y-0">
                {visits.map(v => <React.Fragment key={v.id}><VisitCard visit={v} onMarkComplete={onMarkComplete} onCancel={onCancel} /></React.Fragment>)}
            </div>
        )}
    </div>
);

// ---- Main Component ----
export const SiteVisitsTab: React.FC = () => {
    const [visits, setVisits] = useState<SiteVisit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { toast, showToast } = useToast();

    const fetchVisits = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getSiteVisits();
            setVisits(data);
        } catch {
            setError('Failed to load site visits. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchVisits(); }, [fetchVisits]);

    const handleMarkComplete = async (id: number) => {
        try {
            await updateSiteVisit(id, { status: 'completed' });
            setVisits(v => v.map(x => x.id === id ? { ...x, status: 'completed' } : x));
            showToast('Visit marked as completed!', 'success');
        } catch {
            showToast('Failed to update visit.', 'error');
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await updateSiteVisit(id, { status: 'cancelled' });
            setVisits(v => v.map(x => x.id === id ? { ...x, status: 'cancelled' } : x));
            showToast('Visit cancelled.', 'success');
        } catch {
            showToast('Failed to cancel visit.', 'error');
        }
    };

    const handleSchedule = async (data: Partial<SiteVisit>) => {
        try {
            const newVisit = await createSiteVisit(data);
            setVisits(v => [newVisit, ...v]);
            setShowModal(false);
            showToast('Visit scheduled successfully!', 'success');
        } catch {
            showToast('Failed to schedule visit.', 'error');
        }
    };

    const now = new Date();
    const todayVisits = visits.filter(v => isToday(v.visit_date) && v.status !== 'cancelled');
    const upcomingVisits = visits.filter(v => new Date(v.visit_date) > now && !isToday(v.visit_date) && v.status !== 'cancelled' && v.status !== 'completed');
    const pastVisits = visits.filter(v => new Date(v.visit_date) < now && !isToday(v.visit_date) || v.status === 'completed' || v.status === 'cancelled');
    const completedCount = visits.filter(v => v.status === 'completed').length;
    const thisWeekCount = visits.filter(v => isThisWeek(v.visit_date)).length;

    return (
        <div className="p-6 md:p-8 relative">
            {/* Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Scheduled', value: visits.length, icon: <Calendar size={20} />, color: 'bg-brand-50 text-brand-700' },
                    { label: 'Today', value: todayVisits.length, icon: <Clock size={20} />, color: 'bg-blue-50 text-blue-600' },
                    { label: 'This Week', value: thisWeekCount, icon: <User size={20} />, color: 'bg-purple-50 text-purple-600' },
                    { label: 'Completed', value: completedCount, icon: <CheckCircle size={20} />, color: 'bg-green-50 text-green-700' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                            <p className="text-xl font-bold text-slate-800">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Site Visit Schedule</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
                >
                    <Plus size={16} /> Schedule Visit
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48 text-brand-600">
                    <Loader2 size={36} className="animate-spin" />
                </div>
            ) : error ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle size={18} /> {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Column title="Today" color="text-blue-700" visits={todayVisits} onMarkComplete={handleMarkComplete} onCancel={handleCancel} emptyMsg="No visits scheduled today." />
                    <Column title="Upcoming" color="text-brand-700" visits={upcomingVisits} onMarkComplete={handleMarkComplete} onCancel={handleCancel} emptyMsg="No upcoming visits." />
                    <Column title="Past &amp; Completed" color="text-slate-500" visits={pastVisits} onMarkComplete={handleMarkComplete} onCancel={handleCancel} emptyMsg="No past visits." />
                </div>
            )}

            {showModal && <ScheduleModal onClose={() => setShowModal(false)} onSubmit={handleSchedule} />}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {toast.message}
                </div>
            )}
        </div>
    );
};
