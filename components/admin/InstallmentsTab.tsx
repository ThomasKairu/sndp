import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Lock, CreditCard, Loader2, AlertCircle, CheckCircle, Plus,
    Phone, Trophy, ChevronRight, Calendar, DollarSign, TrendingUp,
    Users, Edit2, X, MessageSquare
} from 'lucide-react';
import {
    getInstallmentPlans, createInstallmentPlan, updateInstallmentPlan,
    recordPayment, getPaymentHistory, verifyInstallmentsPin
} from '../../services/dataService';
import { InstallmentPlan, InstallmentPayment } from '../../types';

const PROPERTIES_LIST = [
    'Matuu Kivandini', 'Sagana Makutano', 'Tola Ngoingwa', 'Kiharu',
    "Mang'u", 'Ithanga', 'Kilimambogo', 'Muguga Gatuanyaga',
    'Makuyu Mananja', 'Athena Thika', 'Thika Town Commercial', 'Mwingi'
];

// ─── Accent colour for this confidential tab ──────────────────────────────────
const G = {
    ring: 'focus:ring-green-700',
    btn: 'bg-green-800 hover:bg-green-900 text-white',
    badge: 'bg-green-100 text-green-800 border-green-300',
    bar: 'bg-green-700',
    text: 'text-green-800',
    light: 'bg-green-50',
    border: 'border-green-200',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKES(n: number) {
    if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1000) return `KES ${(n / 1000).toFixed(0)}K`;
    return `KES ${n.toLocaleString()}`;
}

function formatKESFull(n: number) {
    return `KES ${n.toLocaleString('en-KE')}`;
}

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

function plus30DaysISO() {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function daysUntil(iso: string): number {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function nextMonthSameDay(iso: string): string {
    const d = new Date(iso);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
}

function dueDateColor(iso: string): string {
    const days = daysUntil(iso);
    if (days < 0) return 'text-red-600 font-bold animate-pulse';
    if (days <= 7) return 'text-orange-600 font-semibold';
    return 'text-green-700 font-medium';
}

function formatWALink(phone: string) {
    const c = phone.replace(/\D/g, '');
    const n = c.startsWith('0') ? '254' + c.slice(1) : c.startsWith('254') ? c : '254' + c;
    return `https://wa.me/${n}`;
}

function pct(paid: number, total: number) {
    if (!total) return 0;
    return Math.min(100, Math.round((paid / total) * 100));
}

// ─── Toast Hook ───────────────────────────────────────────────────────────────
function useToast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);
    return { toast, showToast };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: InstallmentPlan['status'] }) => {
    const map: Record<string, string> = {
        active: 'bg-blue-100 text-blue-800 border-blue-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        defaulted: 'bg-red-100 text-red-700 border-red-200',
        paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[status] || map.active}`}>
            {status}
        </span>
    );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
            className={`h-2 rounded-full ${G.bar} transition-all duration-700 ease-out`}
            style={{ width: `${value}%` }}
        />
    </div>
);

// ─── PIN Lock Screen ──────────────────────────────────────────────────────────
const PinLockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
    const pinLength = 4; // Expected display length (server-side verification happens anyway)
    const [digits, setDigits] = useState(Array(pinLength).fill(''));
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleDigit = async (i: number, val: string) => {
        if (verifying) return;
        const ch = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[i] = ch;
        setDigits(next);
        setError('');

        if (ch && i < pinLength - 1) {
            refs.current[i + 1]?.focus();
        }

        // Auto-check when all digits filled
        const filled = next.slice(0, pinLength).join('');
        if (filled.length === pinLength) {
            setVerifying(true);
            try {
                const isValid = await verifyInstallmentsPin(filled);
                if (isValid) {
                    onUnlock();
                } else {
                    setShaking(true);
                    setError('Incorrect PIN. Try again.');
                    setTimeout(() => {
                        setDigits(Array(pinLength).fill(''));
                        setShaking(false);
                        setVerifying(false);
                        refs.current[0]?.focus();
                    }, 700);
                }
            } catch (err) {
                setError('Verification failed. Server error.');
                setVerifying(false);
            }
        }
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) {
            refs.current[i-1]?.focus();
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center bg-slate-950 min-h-full p-6">
            <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden ${shaking ? 'animate-bounce' : ''}`}>
                {/* Header */}
                <div className="bg-green-900 px-8 py-8 flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-green-700 flex items-center justify-center shadow-lg">
                        <Lock size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-white font-bold text-xl tracking-tight">Installments</h2>
                        <p className="text-green-300 text-xs mt-1 uppercase tracking-widest">Confidential — Installment Records</p>
                    </div>
                </div>

                {/* PIN Entry */}
                <div className="px-8 py-8 flex flex-col items-center gap-6">
                    <p className="text-slate-500 text-sm text-center">Enter your {pinLength}-digit PIN to access financial records</p>

                    <div className="flex gap-2 justify-center">
                        {Array.from({ length: pinLength }).map((_, i) => (
                            <input
                                key={i}
                                ref={el => { refs.current[i] = el; }}
                                type="password"
                                inputMode="numeric"
                                maxLength={1}
                                value={digits[i]}
                                onChange={e => handleDigit(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                autoFocus={i === 0}
                                className={`w-10 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition
                                    ${digits[i] ? 'border-green-700 bg-green-50 text-green-900' : 'border-gray-200 bg-gray-50'}
                                    focus:border-green-700 focus:bg-green-50`}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 w-full justify-center">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 text-center">
                        This section contains sensitive financial data.<br />Access is logged and monitored.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─── Add Plan Modal ───────────────────────────────────────────────────────────
const AddPlanModal = ({ onClose, onSave }: {
    onClose: () => void;
    onSave: (plan: Partial<InstallmentPlan>) => Promise<void>;
}) => {
    const [form, setForm] = useState({
        client_name: '', phone: '', property_name: '',
        total_amount: '', installment_count: '6',
        start_date: todayISO(), next_due_date: plus30DaysISO(), notes: ''
    });
    const [saving, setSaving] = useState(false);

    const installmentAmt = form.total_amount && form.installment_count
        ? Math.round((Number(form.total_amount) / Number(form.installment_count)) * 100) / 100
        : 0;

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.client_name || !form.phone || !form.property_name || !form.total_amount || !form.start_date || !form.next_due_date) return;
        setSaving(true);
        try {
            await onSave({
                client_name: form.client_name,
                phone: form.phone,
                property_name: form.property_name,
                total_amount: Number(form.total_amount),
                amount_paid: 0,
                installment_count: Number(form.installment_count),
                installments_paid: 0,
                installment_amount: installmentAmt,
                start_date: form.start_date,
                next_due_date: form.next_due_date,
                status: 'active',
                notes: form.notes || undefined,
            });
        } finally {
            setSaving(false);
        }
    };

    const inputCls = `w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-700 outline-none`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="bg-green-900 p-5 rounded-t-2xl flex justify-between items-center flex-shrink-0">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <CreditCard size={18} /> New Installment Plan
                    </h3>
                    <button onClick={onClose} className="text-green-300 hover:text-white transition text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name *</label>
                            <input value={form.client_name} onChange={e => set('client_name', e.target.value)} required placeholder="Full name" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone *</label>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="07xxxxxxxx" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Property *</label>
                            <select value={form.property_name} onChange={e => set('property_name', e.target.value)} required className={inputCls + ' bg-white'}>
                                <option value="">-- Select --</option>
                                {PROPERTIES_LIST.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Total Amount (KES) *</label>
                            <input type="number" value={form.total_amount} onChange={e => set('total_amount', e.target.value)} required placeholder="e.g. 1800000" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">No. of Installments *</label>
                            <select value={form.installment_count} onChange={e => set('installment_count', e.target.value)} className={inputCls + ' bg-white'}>
                                {[3, 4, 5, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} installments</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Installment Amount</label>
                            <div className={`${inputCls} bg-green-50 text-green-800 font-semibold`}>
                                {installmentAmt ? formatKESFull(installmentAmt) : '—'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date *</label>
                            <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">First Due Date *</label>
                            <input type="date" value={form.next_due_date} onChange={e => set('next_due_date', e.target.value)} required className={inputCls} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any additional notes..." className={inputCls + ' resize-none'} />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className={`w-full ${G.btn} py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition`}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        {saving ? 'Creating Plan...' : 'Create Installment Plan'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Record Payment Modal ─────────────────────────────────────────────────────
const RecordPaymentModal = ({ plan, onClose, onSave }: {
    plan: InstallmentPlan;
    onClose: () => void;
    onSave: (payment: Partial<InstallmentPayment>) => Promise<void>;
}) => {
    const [form, setForm] = useState({
        amount_paid: String(plan.installment_amount),
        payment_date: todayISO(),
        recorded_by: 'Sales Team',
        notes: ''
    });
    const [saving, setSaving] = useState(false);
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const inputCls = `w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-700 outline-none`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                plan_id: plan.id,
                client_name: plan.client_name,
                phone: plan.phone,
                amount_paid: Number(form.amount_paid),
                payment_date: form.payment_date,
                payment_number: plan.installments_paid + 1,
                recorded_by: form.recorded_by,
                notes: form.notes || undefined,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="bg-green-800 p-5 rounded-t-2xl flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <DollarSign size={18} /> Record Payment
                    </h3>
                    <button onClick={onClose} className="text-green-300 hover:text-white transition text-2xl leading-none">&times;</button>
                </div>
                <div className="px-5 py-3 bg-green-50 border-b border-green-100">
                    <p className="text-sm font-semibold text-green-900">{plan.client_name}</p>
                    <p className="text-xs text-green-700">{plan.property_name} · Payment #{plan.installments_paid + 1} of {plan.installment_count}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (KES) *</label>
                            <input type="number" value={form.amount_paid} onChange={e => set('amount_paid', e.target.value)} required className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Date *</label>
                            <input type="date" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} required className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Payment #</label>
                            <div className={`${inputCls} bg-gray-50 text-slate-500`}>{plan.installments_paid + 1}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Recorded By</label>
                            <input value={form.recorded_by} onChange={e => set('recorded_by', e.target.value)} className={inputCls} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={inputCls + ' resize-none'} placeholder="Optional notes..." />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className={`w-full ${G.btn} py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition`}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        {saving ? 'Recording...' : 'Record Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Edit Plan Modal ──────────────────────────────────────────────────────────
const EditPlanModal = ({ plan, onClose, onSave }: {
    plan: InstallmentPlan;
    onClose: () => void;
    onSave: (updates: Partial<InstallmentPlan>) => Promise<void>;
}) => {
    const [form, setForm] = useState({
        next_due_date: plan.next_due_date?.split('T')[0] || '',
        installment_amount: String(plan.installment_amount),
        status: plan.status,
        notes: plan.notes || '',
    });
    const [saving, setSaving] = useState(false);
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const inputCls = `w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-700 outline-none`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                next_due_date: form.next_due_date,
                installment_amount: Number(form.installment_amount),
                status: form.status as InstallmentPlan['status'],
                notes: form.notes || undefined,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="bg-slate-800 p-5 rounded-t-2xl flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2"><Edit2 size={18} /> Edit Plan</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Next Due Date</label>
                            <input type="date" value={form.next_due_date} onChange={e => set('next_due_date', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Installment Amount</label>
                            <input type="number" value={form.installment_amount} onChange={e => set('installment_amount', e.target.value)} className={inputCls} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls + ' bg-white'}>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="defaulted">Defaulted</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={inputCls + ' resize-none'} />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className={`w-full ${G.btn} py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition`}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Plan Card ────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, selected, onClick }: {
    plan: InstallmentPlan; selected: boolean; onClick: () => void;
}) => {
    const progress = pct(plan.amount_paid, plan.total_amount);
    const isCompleted = plan.status === 'completed';

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-green-50 transition group ${selected ? 'bg-green-50 border-l-4 border-l-green-700' : 'border-l-4 border-l-transparent'}`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        {isCompleted && <Trophy size={14} className="text-yellow-500 flex-shrink-0" />}
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{plan.client_name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{plan.property_name}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={plan.status} />
                    {isCompleted && (
                        <span className="text-[9px] font-black text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide">
                            Fully Paid
                        </span>
                    )}
                </div>
            </div>

            <ProgressBar value={progress} />

            <div className="flex justify-between items-center mt-1.5 text-xs text-gray-500">
                <span><b className="text-green-800">{formatKES(plan.amount_paid)}</b> of {formatKES(plan.total_amount)}</span>
                <span className="font-medium">{progress}%</span>
            </div>

            <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-gray-500">{plan.installments_paid}/{plan.installment_count} paid</span>
                {!isCompleted && (
                    <span className={dueDateColor(plan.next_due_date) + ' text-[11px]'}>
                        Due {new Date(plan.next_due_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-end mt-1">
                <ChevronRight size={14} className="text-gray-300 group-hover:text-green-700 transition" />
            </div>
        </button>
    );
};

// ─── Main Installments Tab Component ─────────────────────────────────────────
export const InstallmentsTab: React.FC = () => {
    const [unlocked, setUnlocked] = useState(false);
    const [plans, setPlans] = useState<InstallmentPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null);
    const [payments, setPayments] = useState<InstallmentPayment[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | InstallmentPlan['status']>('all');
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { toast, showToast } = useToast();

    // ── Fetch plans when unlocked ──────────────────────────────────────────
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getInstallmentPlans();
            setPlans(data);
        } catch {
            setError('Failed to load installment plans.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (unlocked) fetchPlans();
    }, [unlocked, fetchPlans]);

    // ── Fetch payment history when plan selected ───────────────────────────
    useEffect(() => {
        if (!selectedPlan) return;
        setPaymentsLoading(true);
        getPaymentHistory(selectedPlan.id).then(data => {
            setPayments(data);
            setPaymentsLoading(false);
        });
    }, [selectedPlan]);

    // ── Stats ──────────────────────────────────────────────────────────────
    const activePlans = plans.filter(p => p.status === 'active');
    const totalCollected = activePlans.reduce((s, p) => s + (p.amount_paid || 0), 0);
    const dueThisWeek = plans.filter(p => p.status === 'active' && daysUntil(p.next_due_date) <= 7 && daysUntil(p.next_due_date) >= 0).length;
    const completedPlans = plans.filter(p => p.status === 'completed').length;

    // ── Filtered list ──────────────────────────────────────────────────────
    const filtered = plans.filter(p => {
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchSearch = !search ||
            p.client_name.toLowerCase().includes(search.toLowerCase()) ||
            p.property_name.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleAddPlan = async (plan: Partial<InstallmentPlan>) => {
        const newPlan = await createInstallmentPlan(plan);
        setPlans(p => [newPlan, ...p]);
        setShowAddModal(false);
        showToast(`Plan created for ${newPlan.client_name}!`, 'success');
    };

    const handleRecordPayment = async (payment: Partial<InstallmentPayment>) => {
        if (!selectedPlan) return;
        // Record payment
        await recordPayment(payment);

        // Calculate updates to plan
        const newAmountPaid = selectedPlan.amount_paid + Number(payment.amount_paid);
        const newInstallmentsPaid = selectedPlan.installments_paid + 1;
        const isComplete = newInstallmentsPaid >= selectedPlan.installment_count;
        const updates: Partial<InstallmentPlan> = {
            amount_paid: newAmountPaid,
            installments_paid: newInstallmentsPaid,
            next_due_date: isComplete ? selectedPlan.next_due_date : nextMonthSameDay(selectedPlan.next_due_date),
            status: isComplete ? 'completed' : selectedPlan.status,
        };

        const updatedPlan = await updateInstallmentPlan(selectedPlan.id, updates);
        setPlans(ps => ps.map(p => p.id === selectedPlan.id ? updatedPlan : p));
        setSelectedPlan(updatedPlan);

        // Refresh payment history
        const history = await getPaymentHistory(selectedPlan.id);
        setPayments(history);

        setShowPayModal(false);
        const progress = pct(newAmountPaid, selectedPlan.total_amount);
        showToast(
            `Payment recorded! ${selectedPlan.client_name} has paid ${newInstallmentsPaid}/${selectedPlan.installment_count} installments (${progress}%)`,
            'success'
        );
    };

    const handleEditPlan = async (updates: Partial<InstallmentPlan>) => {
        if (!selectedPlan) return;
        const updated = await updateInstallmentPlan(selectedPlan.id, updates);
        setPlans(ps => ps.map(p => p.id === selectedPlan.id ? updated : p));
        setSelectedPlan(updated);
        setShowEditModal(false);
        showToast('Plan updated successfully!', 'success');
    };

    // ── PIN gate ───────────────────────────────────────────────────────────
    if (!unlocked) {
        return <PinLockScreen onUnlock={() => setUnlocked(true)} />;
    }

    const STATUS_CHIPS: Array<{ label: string; value: typeof statusFilter }> = [
        { label: 'All', value: 'all' },
        { label: '🔵 Active', value: 'active' },
        { label: '✅ Completed', value: 'completed' },
        { label: '🔴 Defaulted', value: 'defaulted' },
        { label: '⏸ Paused', value: 'paused' },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
            {/* Top Stats */}
            <div className="flex-shrink-0 p-5 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg"><CreditCard size={20} className="text-green-800" /></div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Installment Plans</h2>
                            <p className="text-xs text-gray-500">Confidential financial records</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className={`flex items-center gap-2 ${G.btn} px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm hover:shadow-md`}
                    >
                        <Plus size={15} /> Add New Plan
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Active Plans', value: activePlans.length, icon: <TrendingUp size={18} />, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Total Collected', value: formatKES(totalCollected), icon: <DollarSign size={18} />, color: 'bg-green-50 text-green-800' },
                        { label: 'Due This Week', value: dueThisWeek, icon: <Calendar size={18} />, color: dueThisWeek > 0 ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-500' },
                        { label: 'Completed Plans', value: completedPlans, icon: <Trophy size={18} />, color: 'bg-yellow-50 text-yellow-700' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 shadow-sm">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${s.color}`}>{s.icon}</div>
                            <div className="min-w-0">
                                <p className="text-[11px] text-gray-500 font-medium truncate">{s.label}</p>
                                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two column layout */}
            <div className="flex flex-1 min-h-0 flex-col md:flex-row overflow-hidden md:overflow-visible">
                {/* Left: Plan List */}
                <div className={`w-full md:w-80 xl:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col ${selectedPlan && 'hidden md:flex'}`}>
                    <div className="p-3 border-b border-gray-100 space-y-2">
                        <input
                            type="text"
                            placeholder="Search client or property..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 outline-none"
                        />
                        <div className="flex flex-wrap gap-1">
                            {STATUS_CHIPS.map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => setStatusFilter(c.value)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${statusFilter === c.value ? 'bg-green-800 text-white border-green-800' : 'bg-white text-gray-500 border-gray-200 hover:border-green-600'}`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-32 text-green-800">
                                <Loader2 size={28} className="animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="p-4 text-red-600 text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center text-gray-400 py-16 text-sm">
                                No plans found.
                            </div>
                        ) : (
                            filtered.map(plan => (
                                <React.Fragment key={plan.id}>
                                    <PlanCard
                                        plan={plan}
                                        selected={selectedPlan?.id === plan.id}
                                        onClick={() => setSelectedPlan(plan)}
                                    />
                                </React.Fragment>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Plan Detail */}
                <div className={`flex-1 overflow-y-auto min-w-0 ${!selectedPlan && 'hidden md:block'}`}>
                    {!selectedPlan ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                            <CreditCard size={48} className="opacity-20" />
                            <p className="text-sm">Select a plan to view details</p>
                        </div>
                    ) : (
                        <div className="p-4 md:p-6 max-w-2xl mx-auto">
                            {/* Back button for mobile */}
                            <button 
                                onClick={() => setSelectedPlan(null)}
                                className="md:hidden flex items-center gap-1 text-green-800 font-bold mb-4 bg-green-50 px-3 py-1.5 rounded-lg"
                            >
                                <X size={16} /> Back to list
                            </button>

                            {/* Plan Header */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                                <div className="bg-green-900 px-6 py-5 flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {selectedPlan.status === 'completed' && <Trophy size={18} className="text-yellow-400" />}
                                            <h3 className="text-white font-bold text-xl">{selectedPlan.client_name}</h3>
                                        </div>
                                        <p className="text-green-300 text-sm">{selectedPlan.property_name}</p>
                                        <a href={formatWALink(selectedPlan.phone)} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-green-200 hover:text-white text-xs mt-1 transition">
                                            <MessageSquare size={11} /> {selectedPlan.phone}
                                        </a>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StatusBadge status={selectedPlan.status} />
                                        {selectedPlan.status === 'completed' && (
                                            <span className="text-[10px] font-black text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded uppercase tracking-wide border border-yellow-600/40">
                                                Fully Paid
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-gray-500">Payment Progress</span>
                                            <span className="font-bold text-green-800">{pct(selectedPlan.amount_paid, selectedPlan.total_amount)}%</span>
                                        </div>
                                        <ProgressBar value={pct(selectedPlan.amount_paid, selectedPlan.total_amount)} />
                                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                                            <span><b className="text-green-800">{formatKESFull(selectedPlan.amount_paid)}</b> paid</span>
                                            <span>{formatKESFull(selectedPlan.total_amount)} total</span>
                                        </div>
                                    </div>

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                        <div>
                                            <p className="text-gray-400 text-xs">Installments</p>
                                            <p className="font-semibold text-slate-800">{selectedPlan.installments_paid} / {selectedPlan.installment_count}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Per Installment</p>
                                            <p className="font-semibold text-slate-800">{formatKESFull(selectedPlan.installment_amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Start Date</p>
                                            <p className="font-semibold text-slate-800">{selectedPlan.start_date ? new Date(selectedPlan.start_date).toLocaleDateString('en-KE') : '—'}</p>
                                        </div>
                                        {selectedPlan.status !== 'completed' && (
                                            <div>
                                                <p className="text-gray-400 text-xs">Next Due</p>
                                                <p className={`font-semibold ${dueDateColor(selectedPlan.next_due_date)} text-sm`}>
                                                    {new Date(selectedPlan.next_due_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {daysUntil(selectedPlan.next_due_date) < 0 && ' (OVERDUE)'}
                                                    {daysUntil(selectedPlan.next_due_date) >= 0 && daysUntil(selectedPlan.next_due_date) <= 7 && ` (${daysUntil(selectedPlan.next_due_date)}d)`}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedPlan.notes && (
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
                                            <p className="text-xs font-semibold text-gray-400 mb-1">Notes</p>
                                            {selectedPlan.notes}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-1">
                                        {selectedPlan.status !== 'completed' && (
                                            <button
                                                onClick={() => setShowPayModal(true)}
                                                className={`flex-1 ${G.btn} py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition`}
                                            >
                                                <DollarSign size={15} /> Record Payment
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
                                        >
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Timeline */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h4 className="font-bold text-slate-800 text-sm">Payment History</h4>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{payments.length} records</span>
                                </div>
                                {paymentsLoading ? (
                                    <div className="flex justify-center items-center h-20 text-green-800">
                                        <Loader2 size={22} className="animate-spin" />
                                    </div>
                                ) : payments.length === 0 ? (
                                    <div className="text-center text-gray-400 py-10 text-sm">No payments recorded yet.</div>
                                ) : (
                                    <div className="px-5 py-4 space-y-3">
                                        {[...payments].reverse().map((pay, idx) => (
                                            <div key={pay.id} className="flex items-start gap-4">
                                                {/* Timeline line */}
                                                <div className="flex flex-col items-center flex-shrink-0">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${G.bar}`}>
                                                        {pay.payment_number}
                                                    </div>
                                                    {idx < payments.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" style={{ minHeight: 16 }} />}
                                                </div>
                                                <div className="flex-1 pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-slate-800 text-sm">{formatKESFull(pay.amount_paid)}</p>
                                                        <p className="text-xs text-gray-400">{new Date(pay.payment_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                    <div className="flex gap-3 mt-0.5">
                                                        <span className="text-xs text-gray-400">By {pay.recorded_by}</span>
                                                        {pay.notes && <span className="text-xs text-gray-500 italic">· {pay.notes}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && <AddPlanModal onClose={() => setShowAddModal(false)} onSave={handleAddPlan} />}
            {showPayModal && selectedPlan && (
                <RecordPaymentModal plan={selectedPlan} onClose={() => setShowPayModal(false)} onSave={handleRecordPayment} />
            )}
            {showEditModal && selectedPlan && (
                <EditPlanModal plan={selectedPlan} onClose={() => setShowEditModal(false)} onSave={handleEditPlan} />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 max-w-sm ${toast.type === 'success' ? 'bg-green-700' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
};
