import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar, CheckCircle, XCircle, Plus, Loader2, Clock,
    User, MapPin, MessageSquare, Bell, AlertCircle, ChevronLeft,
    RotateCcw, UserX, Ban, Pencil, Trash2
} from 'lucide-react';
import { getSiteVisits, createSiteVisit, updateSiteVisit, deleteSiteVisit, SiteVisit } from '../../services/dataService';
import { getAdminSecret } from '../../services/dataService';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

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
/** Convert ISO timestamp to "YYYY-MM-DD" and "HH:MM" for input fields */
function isoToDateAndTime(iso: string) {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { date, time };
}

// ---- Outcome badge config ----
type OutcomeKey = 'attended' | 'no_show' | 'rescheduled' | 'cancelled' | 'completed' | 'scheduled' | string;

const OUTCOME_META: Record<string, { label: string; color: string; icon: string }> = {
    attended:    { label: 'Attended',    color: 'bg-green-100 text-green-700 border-green-200',  icon: '✅' },
    no_show:     { label: 'No Show',     color: 'bg-red-100   text-red-700   border-red-200',    icon: '❌' },
    rescheduled: { label: 'Rescheduled', color: 'bg-blue-100  text-blue-700  border-blue-200',   icon: '🔄' },
    cancelled:   { label: 'Cancelled',   color: 'bg-gray-100  text-gray-500  border-gray-200',   icon: '🚫' },
    completed:   { label: 'Completed',   color: 'bg-green-100 text-green-700 border-green-200',  icon: '✅' },
};

function OutcomeBadge({ status }: { status: string }) {
    const meta = OUTCOME_META[status];
    if (!meta) return null;
    return (
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${meta.color}`}>
            {meta.icon} {meta.label}
        </span>
    );
}

// ---- Outcome Modal ----
type OutcomeChoice = 'attended' | 'no_show' | 'rescheduled' | 'cancelled';

const OUTCOME_OPTIONS: { id: OutcomeChoice; label: string; emoji: string; desc: string; border: string; bg: string }[] = [
    {
        id: 'attended',
        emoji: '✅',
        label: 'Attended',
        desc: 'Client came for the visit',
        border: 'border-green-400',
        bg: 'bg-green-50',
    },
    {
        id: 'no_show',
        emoji: '❌',
        label: 'No Show',
        desc: 'Client did not show up',
        border: 'border-red-400',
        bg: 'bg-red-50',
    },
    {
        id: 'rescheduled',
        emoji: '🔄',
        label: 'Rescheduled',
        desc: 'Client needs a new date',
        border: 'border-blue-400',
        bg: 'bg-blue-50',
    },
    {
        id: 'cancelled',
        emoji: '🚫',
        label: 'Cancelled',
        desc: 'Visit will not happen',
        border: 'border-gray-400',
        bg: 'bg-gray-50',
    },
];

interface OutcomeModalResult {
    outcome: OutcomeChoice;
    outcomeNotes: string;
    rescheduleDate?: string; // ISO datetime string, only for rescheduled
}

const OutcomeModal = ({
    visit,
    onClose,
    onConfirm,
}: {
    visit: SiteVisit;
    onClose: () => void;
    onConfirm: (result: OutcomeModalResult) => Promise<void>;
}) => {
    const [selected, setSelected] = useState<OutcomeChoice | null>(null);
    const [notes, setNotes] = useState('');
    const [reschedDate, setReschedDate] = useState('');
    const [reschedTime, setReschedTime] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const canConfirm = selected !== null &&
        (selected !== 'rescheduled' || (reschedDate.trim() !== '' && reschedTime.trim() !== ''));

    const handleConfirm = async () => {
        if (!selected || !canConfirm) return;
        setError('');
        setSubmitting(true);
        try {
            const result: OutcomeModalResult = {
                outcome: selected,
                outcomeNotes: notes.trim(),
            };
            if (selected === 'rescheduled') {
                result.rescheduleDate = new Date(`${reschedDate}T${reschedTime}`).toISOString();
            }
            await onConfirm(result);
        } catch (err: any) {
            setError(err.message || 'Failed to save. Please try again.');
            setSubmitting(false);
        }
    };

    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-slate-800 p-5 flex justify-between items-center">
                    <div>
                        <h3 className="text-white font-bold text-lg">How did the visit go?</h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                            {visit.customer_name} · {visit.property_name}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <XCircle size={22} />
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Outcome options */}
                    <div className="grid grid-cols-2 gap-3">
                        {OUTCOME_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelected(opt.id)}
                                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-center transition-all cursor-pointer
                                    ${selected === opt.id
                                        ? `${opt.border} ${opt.bg} shadow-md scale-[1.02]`
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-2xl">{opt.emoji}</span>
                                <span className="font-bold text-sm text-slate-800">{opt.label}</span>
                                <span className="text-[11px] text-slate-500 leading-tight">{opt.desc}</span>
                            </button>
                        ))}
                    </div>

                    {/* Reschedule date/time picker */}
                    {selected === 'rescheduled' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">New Visit Date &amp; Time</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        value={reschedDate}
                                        onChange={e => setReschedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1 block">Time</label>
                                    <input
                                        type="time"
                                        value={reschedTime}
                                        onChange={e => setReschedTime(e.target.value)}
                                        required
                                        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Optional notes */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                            Notes <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any extra context about the visit..."
                            rows={2}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none transition"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
                        >
                            <ChevronLeft size={15} /> Back
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!canConfirm || submitting}
                            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-black text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-40 shadow-md"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ---- Edit Modal ----
const STATUS_OPTIONS = ['scheduled', 'attended', 'no_show', 'rescheduled', 'cancelled', 'completed'];

const PROPERTY_NAMES_EDIT = [
    'Prime ½ Acre in Kiharu', "1 Acre at Mang'u", 'Sagana Makutano Plots',
    "Ithanga Murang'a Plots", 'Kilimambogo / Oldonyo Sabuk', 'Tola Ngoingwa',
    'Muguga / Gatuanyaga', 'Makuyu Mananja Acre', 'Matuu Plots',
    'Landless Thika', 'Thika Town Commercial', 'Mwingi Acre'
];

const EditModal = ({
    visit,
    onClose,
    onSave,
}: {
    visit: SiteVisit;
    onClose: () => void;
    onSave: (updated: SiteVisit) => void;
}) => {
    const { date: initDate, time: initTime } = isoToDateAndTime(visit.visit_date);
    const [form, setForm] = useState({
        customer_name: visit.customer_name,
        sender_id: visit.sender_id,
        property_name: visit.property_name,
        date: initDate,
        time: initTime,
        visit_day: visit.visit_day || '',
        status: visit.status,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const iso = new Date(`${form.date}T${form.time}`).toISOString();
            const updated = await updateSiteVisit(visit.id, {
                customer_name: form.customer_name,
                sender_id: form.sender_id,
                property_name: form.property_name,
                visit_date: iso,
                visit_day: form.visit_day || form.date,
                status: form.status,
            });
            onSave(updated);
        } catch (err: any) {
            setError(err.message || 'Failed to save changes.');
            setSubmitting(false);
        }
    };

    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-brand-600 p-5 flex justify-between items-center">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Pencil size={17} /> Edit Visit
                        </h3>
                        <p className="text-brand-200 text-xs mt-0.5">ID #{visit.id}</p>
                    </div>
                    <button onClick={onClose} className="text-brand-200 hover:text-white transition">
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Customer Name */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Customer Name</label>
                        <input
                            value={form.customer_name}
                            onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                            required
                            placeholder="Full name"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Phone Number</label>
                        <input
                            value={form.sender_id}
                            onChange={e => setForm(f => ({ ...f, sender_id: e.target.value }))}
                            required
                            placeholder="07xxxxxxxx"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                    </div>

                    {/* Property */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Property</label>
                        <select
                            value={form.property_name}
                            onChange={e => setForm(f => ({ ...f, property_name: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white transition"
                        >
                            {/* Keep the existing value even if it doesn't match list items */}
                            {!PROPERTY_NAMES_EDIT.includes(form.property_name) && (
                                <option value={form.property_name}>{form.property_name}</option>
                            )}
                            {PROPERTY_NAMES_EDIT.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Time</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Visit Day (text) */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Visit Day Label <span className="font-normal text-slate-400">(optional)</span></label>
                        <input
                            value={form.visit_day}
                            onChange={e => setForm(f => ({ ...f, visit_day: e.target.value }))}
                            placeholder="e.g. Saturday"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Status</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white transition"
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ---- Delete Confirmation Dialog ----
const DeleteConfirmDialog = ({
    visit,
    onClose,
    onConfirm,
}: {
    visit: SiteVisit;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) => {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        setError('');
        setDeleting(true);
        try {
            await onConfirm();
        } catch (err: any) {
            setError(err.message || 'Failed to delete visit.');
            setDeleting(false);
        }
    };

    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center space-y-4">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <Trash2 size={26} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Delete Visit?</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            This will permanently remove{' '}
                            <span className="font-semibold text-slate-700">{visit.customer_name}'s</span>{' '}
                            visit. Are you sure?
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-gray-50 transition"
                        >
                            Keep It
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={deleting}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                        >
                            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ---- Visit Card ----
const VisitCard = ({
    visit,
    onMarkComplete,
    onCancel,
    onEdit,
    onDelete,
}: {
    visit: SiteVisit;
    onMarkComplete: (visit: SiteVisit) => void;
    onCancel: (id: number) => void;
    onEdit: (visit: SiteVisit) => void;
    onDelete: (visit: SiteVisit) => void;
}) => {
    const isPast = new Date(visit.visit_date) < new Date() && visit.status !== 'completed';
    const isCancelled = visit.status === 'cancelled';
    const isCompleted = ['completed', 'attended', 'no_show', 'rescheduled', 'cancelled'].includes(visit.status);
    const hasOutcome = ['attended', 'no_show', 'rescheduled', 'cancelled'].includes(visit.status);
    // Only show delete icon on upcoming/scheduled visits (not past/completed)
    const isUpcoming = !isCompleted && !isToday(visit.visit_date);

    const topBadge = hasOutcome
        ? null
        : (
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                visit.status === 'completed' ? 'bg-green-100 text-green-700' :
                isCancelled ? 'bg-gray-100 text-gray-500' :
                isPast ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'
            }`}>
                {visit.status === 'completed' ? 'Completed' : isCancelled ? 'Cancelled' : isPast ? 'Overdue' : 'Scheduled'}
            </span>
        );

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-4 mb-3 transition hover:shadow-md relative ${isCancelled ? 'opacity-60' : ''}`}>
            {/* Edit / Delete icon buttons — top right corner */}
            <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                    onClick={() => onEdit(visit)}
                    title="Edit visit"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                >
                    <Pencil size={13} />
                </button>
                {isUpcoming && (
                    <button
                        onClick={() => onDelete(visit)}
                        title="Delete visit"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>

            <div className="flex items-start justify-between mb-3 pr-14">
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
                {hasOutcome ? <OutcomeBadge status={visit.status} /> : topBadge}
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
            {/* Outcome notes */}
            {visit.outcome_notes && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 mb-3 text-xs text-slate-600 italic">
                    📝 {visit.outcome_notes}
                </div>
            )}
            {/* Reminder badges */}
            <div className="flex gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${visit.reminder_24hr_sent ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    <Bell size={9} /> 24hr {visit.reminder_24hr_sent ? '✅' : '⏳'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${visit.reminder_morning_sent ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    <Bell size={9} /> Morning {visit.reminder_morning_sent ? '✅' : '⏳'}
                </span>
            </div>
            {/* Actions — only for non-completed, non-cancelled visits */}
            {!isCompleted && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onMarkComplete(visit)}
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

const PROPERTY_NAMES = [
    'Prime ½ Acre in Kiharu', "1 Acre at Mang'u", 'Sagana Makutano Plots',
    "Ithanga Murang'a Plots", 'Kilimambogo / Oldonyo Sabuk', 'Tola Ngoingwa',
    'Muguga / Gatuanyaga', 'Makuyu Mananja Acre', 'Matuu Plots',
    'Landless Thika', 'Thika Town Commercial', 'Mwingi Acre'
];

// ---- Schedule Modal ----
const ScheduleModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: Partial<SiteVisit>) => void }) => {
    const [form, setForm] = useState({
        customer_name: '', sender_id: '', property_name: PROPERTY_NAMES[0],
        date: '', time: '', notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customer_name || !form.sender_id || !form.property_name || !form.date || !form.time) return;
        setSubmitting(true);
        try {
            const iso = new Date(`${form.date}T${form.time}`).toISOString();
            await onSubmit({
                customer_name: form.customer_name,
                sender_id: form.sender_id,
                property_name: form.property_name,
                visit_date: iso,
                notes: form.notes,
                status: 'scheduled'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-brand-600 p-5 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">Schedule a Site Visit</h3>
                    <button onClick={onClose} className="text-brand-200 hover:text-white transition"><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Customer Name</label>
                        <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required placeholder="Full name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Phone Number</label>
                        <input value={form.sender_id} onChange={e => setForm(f => ({ ...f, sender_id: e.target.value }))} required placeholder="07xxxxxxxx" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Interest Property</label>
                        <select value={form.property_name} onChange={e => setForm(f => ({ ...f, property_name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white transition">
                            {PROPERTY_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date</label>
                            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Time</label>
                            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Internal Notes</label>
                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any specific requirements..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none transition" />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
                        Schedule Visit
                    </button>
                </form>
            </div>
        </div>
    );
};

// ---- Column ----
const Column = ({
    title, color, visits, onMarkComplete, onCancel, onEdit, onDelete, emptyMsg
}: {
    title: string; color: string; visits: SiteVisit[];
    onMarkComplete: (visit: SiteVisit) => void;
    onCancel: (id: number) => void;
    onEdit: (visit: SiteVisit) => void;
    onDelete: (visit: SiteVisit) => void;
    emptyMsg: string;
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
                {visits.map(v => (
                    <React.Fragment key={v.id}>
                        <VisitCard
                            visit={v}
                            onMarkComplete={onMarkComplete}
                            onCancel={onCancel}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </React.Fragment>
                ))}
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

    // Outcome modal state
    const [outcomeVisit, setOutcomeVisit] = useState<SiteVisit | null>(null);

    // Edit modal state
    const [editVisit, setEditVisit] = useState<SiteVisit | null>(null);

    // Delete confirm state
    const [deleteVisit, setDeleteVisit] = useState<SiteVisit | null>(null);

    const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');
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

    // Opens the outcome modal
    const handleMarkComplete = (visit: SiteVisit) => {
        setOutcomeVisit(visit);
    };

    // Called when the user confirms an outcome
    const handleOutcomeConfirm = async (result: OutcomeModalResult) => {
        if (!outcomeVisit) return;
        const id = outcomeVisit.id;

        if (result.outcome === 'rescheduled' && result.rescheduleDate) {
            const response = await fetch(`${API_BASE}/api/site-visits?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-secret': getAdminSecret(),
                },
                body: JSON.stringify({
                    reschedule_new_date: result.rescheduleDate,
                    outcome_notes: result.outcomeNotes || undefined,
                }),
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to reschedule: ${text}`);
            }
            const { updated, created } = await response.json() as { updated: SiteVisit; created: SiteVisit };

            setVisits(vs => [
                ...vs.map(v => v.id === id ? { ...v, status: 'rescheduled', outcome_notes: result.outcomeNotes || undefined } : v),
                created,
            ]);
            showToast('Visit rescheduled — new visit created!', 'success');
        } else {
            const updated = await updateSiteVisit(id, {
                status: result.outcome,
                outcome_notes: result.outcomeNotes || undefined,
            });
            setVisits(vs => vs.map(v => v.id === id ? { ...v, ...updated } : v));
            const labels: Record<string, string> = {
                attended: 'Visit marked as Attended ✅',
                no_show: 'Visit marked as No Show ❌',
                cancelled: 'Visit cancelled 🚫',
            };
            showToast(labels[result.outcome] || 'Visit updated.', 'success');
        }

        setOutcomeVisit(null);
    };

    // Edit handlers
    const handleEdit = (visit: SiteVisit) => {
        setEditVisit(visit);
    };
    const handleEditSave = (updated: SiteVisit) => {
        setVisits(vs => vs.map(v => v.id === updated.id ? updated : v));
        setEditVisit(null);
        showToast('Visit updated successfully ✏️', 'success');
    };

    // Delete handlers
    const handleDeleteRequest = (visit: SiteVisit) => {
        setDeleteVisit(visit);
    };
    const handleDeleteConfirm = async () => {
        if (!deleteVisit) return;
        await deleteSiteVisit(deleteVisit.id);
        setVisits(vs => vs.filter(v => v.id !== deleteVisit.id));
        setDeleteVisit(null);
        showToast('Visit deleted.', 'success');
    };

    // Cancel
    const handleCancel = async (id: number) => {
        try {
            await updateSiteVisit(id, { status: 'cancelled' });
            setVisits(v => v.map(x => x.id === id ? { ...x, status: 'cancelled' } : x));
            showToast('Visit cancelled.', 'success');
        } catch {
            showToast('Failed to cancel visit.', 'error');
        }
    };

    // Schedule
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
    const upcomingVisits = visits.filter(v => new Date(v.visit_date) > now && !isToday(v.visit_date) && v.status !== 'cancelled' && v.status !== 'completed' && v.status !== 'attended' && v.status !== 'no_show' && v.status !== 'rescheduled');
    const pastVisits = visits.filter(v =>
        (new Date(v.visit_date) < now && !isToday(v.visit_date)) ||
        ['completed', 'attended', 'no_show', 'rescheduled', 'cancelled'].includes(v.status)
    );
    const completedCount = visits.filter(v => ['completed', 'attended'].includes(v.status)).length;
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

            {/* Mobile Tab Toggle */}
            <div className="flex md:hidden bg-gray-100 p-1 rounded-xl mb-6">
                {(['today', 'upcoming', 'past'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === tab ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
                    >
                        {tab === 'today' ? 'Today' : tab === 'upcoming' ? 'Upcoming' : 'Past'}
                    </button>
                ))}
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
                    <div className={activeTab === 'today' ? 'block' : 'hidden md:block'}>
                        <Column title="Today" color="text-blue-700" visits={todayVisits} onMarkComplete={handleMarkComplete} onCancel={handleCancel} onEdit={handleEdit} onDelete={handleDeleteRequest} emptyMsg="No visits scheduled today." />
                    </div>
                    <div className={activeTab === 'upcoming' ? 'block' : 'hidden md:block'}>
                        <Column title="Upcoming" color="text-brand-700" visits={upcomingVisits} onMarkComplete={handleMarkComplete} onCancel={handleCancel} onEdit={handleEdit} onDelete={handleDeleteRequest} emptyMsg="No upcoming visits." />
                    </div>
                    <div className={activeTab === 'past' ? 'block' : 'hidden md:block'}>
                        <Column title="Past & Completed" color="text-slate-500" visits={pastVisits} onMarkComplete={handleMarkComplete} onCancel={handleCancel} onEdit={handleEdit} onDelete={handleDeleteRequest} emptyMsg="No past visits." />
                    </div>
                </div>
            )}

            {/* Schedule modal */}
            {showModal && <ScheduleModal onClose={() => setShowModal(false)} onSubmit={handleSchedule} />}

            {/* Outcome modal */}
            {outcomeVisit && (
                <OutcomeModal
                    visit={outcomeVisit}
                    onClose={() => setOutcomeVisit(null)}
                    onConfirm={handleOutcomeConfirm}
                />
            )}

            {/* Edit modal */}
            {editVisit && (
                <EditModal
                    visit={editVisit}
                    onClose={() => setEditVisit(null)}
                    onSave={handleEditSave}
                />
            )}

            {/* Delete confirmation */}
            {deleteVisit && (
                <DeleteConfirmDialog
                    visit={deleteVisit}
                    onClose={() => setDeleteVisit(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {toast.message}
                </div>
            )}
        </div>
    );
};
