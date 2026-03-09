import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Search,
    Download,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    ShieldCheck,
    Lock,
    Home,
    FileText,
    Loader2,
    Radio,
    X,
    ExternalLink,
    Flame,
    TrendingUp,
    DollarSign,
    UserX,
    ChevronDown,
    Send,
    CreditCard
} from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { getLeads, updateLead, triggerFollowup, Lead } from '../services/dataService';

import { PropertiesTab } from '../components/admin/PropertiesTab';
import { BlogPostsTab } from '../components/admin/BlogPostsTab';
import { SiteVisitsTab } from '../components/admin/SiteVisitsTab';
import { InstallmentsTab } from '../components/admin/InstallmentsTab';
import { WhatsAppCRMTab } from '../components/admin/WhatsAppCRMTab';
import { BroadcastsTab } from '../components/admin/BroadcastsTab';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_PRICES: Record<string, number> = {
    'Matuu Kivandini': 280000, 'Sagana Makutano': 650000, 'Tola Ngoingwa': 2300000,
    'Kiharu': 1800000, "Mang'u": 5000000, 'Ithanga': 650000, 'Kilimambogo': 650000,
    'Muguga Gatuanyaga': 1800000, 'Makuyu Mananja': 2600000, 'Athena Thika': 2500000,
    'Thika Town Commercial': 7500000, 'Mwingi': 200000
};

const STATUS_OPTIONS = ['NEW', 'warm', 'hot', 'converted', 'cold', 'CLOSED'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(iso?: string): number {
    if (!iso) return 0;
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function formatWALink(phone: string) {
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('0') ? '254' + cleaned.slice(1) : cleaned.startsWith('254') ? cleaned : '254' + cleaned;
    return `https://wa.me/${normalized}`;
}

function parsePipelineValue(interest: string): number {
    for (const [name, price] of Object.entries(PROPERTY_PRICES)) {
        if (interest?.toLowerCase().includes(name.toLowerCase())) return price;
    }
    return 0;
}

function formatKES(n: number) {
    if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `KES ${(n / 1000).toFixed(0)}K`;
    return `KES ${n}`;
}

// ─── Toast Hook ───────────────────────────────────────────────────────────────

function useToast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);
    return { toast, showToast };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color, sub }: {
    title: string; value: string | number; icon: React.ReactNode;
    color: string; sub?: string;
}) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition">
        <div className="min-w-0">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800 truncate">{value}</h3>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-3 rounded-lg flex-shrink-0 ml-3 ${color}`}>{icon}</div>
    </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        new: 'bg-blue-100 text-blue-800 border-blue-200',
        NEW: 'bg-blue-100 text-blue-800 border-blue-200',
        warm: 'bg-orange-100 text-orange-800 border-orange-200',
        hot: 'bg-red-100 text-red-800 border-red-200',
        converted: 'bg-green-100 text-green-800 border-green-200',
        CLOSED: 'bg-green-100 text-green-800 border-green-200',
        contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        qualified: 'bg-purple-100 text-purple-800 border-purple-200',
        cold: 'bg-gray-100 text-gray-600 border-gray-200',
        lost: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.new}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// ─── Lead Drawer ──────────────────────────────────────────────────────────────

const LeadDrawer = ({ lead, onClose, onUpdate, showToast }: {
    lead: Lead;
    onClose: () => void;
    onUpdate: (id: number, updates: Partial<Lead>) => void;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}) => {
    const [status, setStatus] = useState(lead.status);
    const [saving, setSaving] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const days = daysSince(lead.last_active || lead.created_at);

    const saveStatus = async (newStatus: string) => {
        setStatus(newStatus);
        setSaving(true);
        try {
            await updateLead(lead.id, { status: newStatus });
            onUpdate(lead.id, { status: newStatus });
            showToast('Status updated!', 'success');
        } catch {
            showToast('Failed to update status.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTriggerFollowup = async () => {
        setTriggering(true);
        try {
            await triggerFollowup(lead.id);
            showToast('Follow-up triggered!', 'success');
        } catch {
            showToast('Failed to trigger follow-up.', 'error');
        } finally {
            setTriggering(false);
        }
    };

    const handleMarkConverted = () => saveStatus('converted');
    const handleMarkHot = () => saveStatus('hot');

    return (
        <div className="fixed inset-0 z-40 flex" onClick={onClose}>
            {/* Backdrop */}
            <div className="flex-1 bg-black/40 backdrop-blur-sm" />
            {/* Drawer */}
            <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-slate-800 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
                            {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-bold">{lead.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lead.source === 'whatsapp' ? 'bg-green-500 text-white' : 'bg-brand-600 text-white'}`}>
                                {lead.source === 'whatsapp' ? '📱 WhatsApp' : '🌐 Website'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={22} /></button>
                </div>

                <div className="p-5 space-y-5 flex-1">
                    {/* Contact Info */}
                    <div className="space-y-2">
                        {lead.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Phone size={14} className="text-brand-500" />
                                <a href={`tel:${lead.phone}`} className="hover:text-brand-600">{lead.phone}</a>
                                <a href={formatWALink(lead.phone)} target="_blank" rel="noopener noreferrer"
                                    className="ml-auto text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 transition font-medium">
                                    <ExternalLink size={10} /> WhatsApp
                                </a>
                            </div>
                        )}
                        {lead.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Mail size={14} className="text-brand-500" />
                                <a href={`mailto:${lead.email}`} className="hover:text-brand-600">{lead.email}</a>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Calendar size={14} className="text-brand-500" />
                            <span>Last contact: <b className={days >= 7 ? 'text-red-600' : 'text-slate-700'}>{days} day{days !== 1 ? 's' : ''} ago</b></span>
                        </div>
                    </div>

                    {/* Interest */}
                    {lead.interest && (
                        <div className="bg-brand-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">Interest</p>
                            <p className="text-sm text-slate-700">{lead.interest}</p>
                        </div>
                    )}

                    {/* AI Summary */}
                    {lead.ai_summary && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">AI Summary</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{lead.ai_summary}</p>
                        </div>
                    )}

                    {/* Status dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Update Status</label>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={e => saveStatus(e.target.value)}
                                disabled={saving}
                                className="w-full border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-white disabled:opacity-60"
                            >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 pointer-events-none text-gray-400" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                        <button
                            onClick={handleMarkConverted}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60"
                        >
                            <CheckCircle size={15} /> Mark as Converted
                        </button>
                        <button
                            onClick={handleMarkHot}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60"
                        >
                            <Flame size={15} /> Mark as Hot
                        </button>
                        <button
                            onClick={handleTriggerFollowup}
                            disabled={triggering}
                            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60"
                        >
                            {triggering ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                            {triggering ? 'Triggering...' : 'Trigger Follow-up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('leads');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [leadsLoading, setLeadsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const { toast, showToast } = useToast();

    const MAX_ATTEMPTS = 5;
    const LOCKOUT_SECONDS = 60;
    const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

    useEffect(() => {
        const lockedUntil = Number(sessionStorage.getItem('admin_locked_until') || '0');
        const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
        if (remaining > 0) setLockoutSecondsLeft(remaining);
    }, []);

    useEffect(() => {
        if (lockoutSecondsLeft <= 0) return;
        const timer = setInterval(() => {
            setLockoutSecondsLeft(prev => {
                if (prev <= 1) {
                    sessionStorage.removeItem('admin_locked_until');
                    sessionStorage.removeItem('admin_fail_count');
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutSecondsLeft]);

    const fetchLeads = useCallback(async () => {
        setLeadsLoading(true);
        try {
            const data = await getLeads();
            setLeads(data);
        } catch (err) {
            console.error('Failed to load leads', err);
        } finally {
            setLeadsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && activeTab === 'leads') {
            fetchLeads();
        }
    }, [isAuthenticated, activeTab, fetchLeads]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        const lockedUntil = Number(sessionStorage.getItem('admin_locked_until') || '0');
        if (Date.now() < lockedUntil) {
            const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
            setLoginError(`Too many failed attempts. Try again in ${remaining}s.`);
            return;
        }
        setIsLoggingIn(true);
        const secret = password;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/leads?limit=1`, {
                headers: { 'x-internal-secret': secret }
            });
            if (response.ok) {
                sessionStorage.removeItem('admin_fail_count');
                sessionStorage.removeItem('admin_locked_until');
                sessionStorage.setItem('admin_secret', secret);
                setIsAuthenticated(true);
            } else {
                let errorMessage = 'Invalid Access Key. Access Denied.';
                try {
                    const errorData = await response.json() as any;
                    if (errorData.message) errorMessage = `Server Error: ${errorData.message}`;
                    else if (errorData.hint) errorMessage = `Auth Error: ${errorData.hint}`;
                } catch { }
                const fails = Number(sessionStorage.getItem('admin_fail_count') || '0') + 1;
                sessionStorage.setItem('admin_fail_count', String(fails));
                if (fails >= MAX_ATTEMPTS) {
                    const until = Date.now() + LOCKOUT_SECONDS * 1000;
                    sessionStorage.setItem('admin_locked_until', String(until));
                    setLockoutSecondsLeft(LOCKOUT_SECONDS);
                    setLoginError(`Too many failed attempts. Locked for ${LOCKOUT_SECONDS}s.`);
                } else {
                    setLoginError(`${errorMessage} (${MAX_ATTEMPTS - fails} attempt${MAX_ATTEMPTS - fails === 1 ? '' : 's'} remaining)`);
                }
                sessionStorage.removeItem('admin_secret');
            }
        } catch (err: any) {
            if (err.message && err.message.includes('Failed to fetch')) {
                setLoginError('Request Blocked. Please disable your Ad-Blocker or Brave Shields for this site.');
            } else {
                setLoginError('Connection Error. Please check your network.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_secret');
    };

    useEffect(() => {
        const storedSecret = sessionStorage.getItem('admin_secret');
        if (!storedSecret) return;
        fetch(`${import.meta.env.VITE_API_BASE || ''}/api/leads?limit=1`, {
            headers: { 'x-internal-secret': storedSecret }
        })
            .then(res => { if (res.ok) setIsAuthenticated(true); else sessionStorage.removeItem('admin_secret'); })
            .catch(() => { sessionStorage.removeItem('admin_secret'); });
    }, []);

    // ── Computed Lead Stats ──────────────────────────────────────────────────

    const warmLeads = leads.filter(l => l.status === 'warm' || l.status === 'NEW').length;
    const hotLeads = leads.filter(l => l.status === 'hot').length;
    const convertedLeads = leads.filter(l => l.status === 'converted' || l.status === 'CLOSED').length;
    const silentLeads = leads.filter(l => l.source === 'whatsapp' && daysSince(l.last_active || l.created_at) >= 7).length;
    const pipelineValue = leads.reduce((sum, l) => sum + parsePipelineValue(l.interest || ''), 0);
    const conversionRate = leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : '0.0';

    // ── Filtering ────────────────────────────────────────────────────────────

    const STATUS_FILTERS = [
        { label: 'All', value: 'all' },
        { label: '🔥 Hot', value: 'hot' },
        { label: '🌡️ Warm', value: 'warm' },
        { label: '✅ Converted', value: 'converted' },
        { label: '🥶 Cold/Silent', value: 'cold' },
    ];

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter ||
            (statusFilter === 'converted' && lead.status === 'CLOSED') ||
            (statusFilter === 'warm' && lead.status === 'NEW');
        const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
        return matchesSearch && matchesStatus && matchesSource;
    });

    const updateLeadInState = (id: number, updates: Partial<Lead>) => {
        setLeads(ls => ls.map(l => l.id === id ? { ...l, ...updates } : l));
        if (selectedLead?.id === id) setSelectedLead(s => s ? { ...s, ...updates } : s);
    };

    // ── Header title map ─────────────────────────────────────────────────────
    const TAB_TITLES: Record<string, string> = {
        leads: 'Leads Overview',
        sitevisits: 'Site Visits',
        installments: '🔐 Installment Plans',
        whatsapp: 'WhatsApp CRM',
        properties: 'Property Listings',
        blog: 'Blog Management',
        broadcasts: 'Broadcasts',
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Helmet><title>CRM Login | Provision Land</title></Helmet>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="bg-brand-600 p-8 text-center">
                        <h1 className="text-2xl font-serif font-bold text-white mb-2">Provision CRM</h1>
                        <p className="text-brand-100 text-sm">Authorized Personnel Only</p>
                    </div>
                    <div className="p-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Secure Access Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={lockoutSecondsLeft > 0}
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        placeholder={lockoutSecondsLeft > 0 ? `Locked — wait ${lockoutSecondsLeft}s` : 'Enter secure key...'}
                                    />
                                </div>
                                {loginError && (
                                    <div className="text-red-500 text-sm flex items-center gap-1 mt-2">
                                        <AlertCircle size={14} /><span>{loginError}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isLoggingIn || lockoutSecondsLeft > 0}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isLoggingIn ? 'Verifying...' : lockoutSecondsLeft > 0 ? `Locked (${lockoutSecondsLeft}s)` : 'Access Dashboard'}
                            </button>
                        </form>
                        <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                            <ShieldCheck size={12} /><span>Protected by 256-bit encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Helmet><title>CRM Dashboard | Provision Land</title></Helmet>

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-serif font-bold text-white">Provision<span className="text-brand-500">CRM</span></h2>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {[
                        { id: 'leads', icon: <LayoutDashboard size={20} />, label: 'Leads Dashboard' },
                        { id: 'sitevisits', icon: <Calendar size={20} />, label: 'Site Visits' },
                        { id: 'installments', icon: <CreditCard size={20} />, label: 'Installments' },
                        { id: 'whatsapp', icon: <MessageSquare size={20} />, label: 'WhatsApp CRM' },
                        { id: 'properties', icon: <Home size={20} />, label: 'Properties' },
                        { id: 'blog', icon: <FileText size={20} />, label: 'Blog Posts' },
                        { id: 'broadcasts', icon: <Radio size={20} />, label: 'Broadcasts' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${activeTab === item.id ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            {item.icon}<span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition text-sm"
                    >
                        <LogOut size={20} /><span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                {/* Top Header */}
                <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-slate-800">{TAB_TITLES[activeTab] || 'Dashboard'}</h1>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                            Production Mode
                        </div>
                        <div className="h-10 w-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                            SA
                        </div>
                    </div>
                </header>

                {/* ── Leads Tab ── */}
                {activeTab === 'leads' && (
                    <div className="p-6 md:p-8">
                        {/* 6 Stat Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                            <StatCard title="Warm Leads" value={warmLeads} icon={<TrendingUp size={20} />} color="bg-orange-50 text-orange-600" />
                            <StatCard title="Hot Leads" value={hotLeads} icon={<Flame size={20} />} color="bg-red-50 text-red-600" />
                            <StatCard title="Converted" value={convertedLeads} icon={<CheckCircle size={20} />} color="bg-green-50 text-green-600" />
                            <StatCard title="Silent" value={silentLeads} sub="WhatsApp 7+ days" icon={<UserX size={20} />} color="bg-gray-100 text-gray-600" />
                            <StatCard title="Pipeline" value={formatKES(pipelineValue)} icon={<DollarSign size={20} />} color="bg-brand-50 text-brand-700" />
                            <StatCard title="Conversion" value={`${conversionRate}%`} icon={<TrendingUp size={20} />} color="bg-purple-50 text-purple-600" />
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {STATUS_FILTERS.map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => setStatusFilter(f.value)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${statusFilter === f.value ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                            {/* Source pills */}
                            <div className="ml-auto flex gap-2">
                                {[{ label: 'All', value: 'all' }, { label: '📱 WhatsApp', value: 'whatsapp' }, { label: '🌐 Website', value: 'website' }].map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setSourceFilter(f.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${sourceFilter === f.value ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-500 border-gray-200 hover:border-slate-400'}`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search + Export */}
                        <div className="bg-white rounded-t-xl p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition text-sm">
                                <Download size={16} /><span>Export CSV</span>
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border-x border-b border-gray-100">
                            {leadsLoading ? (
                                <div className="flex justify-center items-center h-32 text-brand-600">
                                    <Loader2 size={32} className="animate-spin" />
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b border-gray-100">
                                            <th className="p-4">Name &amp; Contact</th>
                                            <th className="p-4">Interest</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Days Silent</th>
                                            <th className="p-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredLeads.map(lead => {
                                            const days = daysSince(lead.last_active || lead.created_at);
                                            return (
                                                <tr
                                                    key={lead.id}
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="hover:bg-brand-50/40 transition duration-150 cursor-pointer group"
                                                >
                                                    <td className="p-4">
                                                        <div className="font-medium text-slate-800">{lead.name}</div>
                                                        <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-1">
                                                            {lead.email && <span className="flex items-center gap-1"><Mail size={10} />{lead.email}</span>}
                                                            <span className="flex items-center gap-1"><Phone size={10} />{lead.phone}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm text-slate-700 font-medium">{lead.interest}</div>
                                                        <div className={`text-xs inline-block px-1.5 py-0.5 rounded mt-1 font-medium ${lead.source === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-brand-50 text-brand-600'}`}>
                                                            {lead.source === 'whatsapp' ? '📱 WhatsApp' : '🌐 Website'}
                                                        </div>
                                                    </td>
                                                    <td className="p-4"><StatusBadge status={lead.status} /></td>
                                                    <td className="p-4">
                                                        <span className={`text-sm font-medium ${days >= 7 ? 'text-red-600' : 'text-gray-500'}`}>{days}d</span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                                                        <div className="text-xs text-gray-400">{lead.created_at ? new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                            {!leadsLoading && filteredLeads.length === 0 && (
                                <div className="p-12 text-center text-gray-500">
                                    No leads found matching your filters.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'sitevisits' && <SiteVisitsTab />}
                {activeTab === 'installments' && <InstallmentsTab />}
                {activeTab === 'whatsapp' && <WhatsAppCRMTab />}
                {activeTab === 'properties' && <PropertiesTab />}
                {activeTab === 'blog' && <BlogPostsTab />}
                {activeTab === 'broadcasts' && <BroadcastsTab />}
            </main>

            {/* Lead Detail Drawer */}
            {selectedLead && (
                <LeadDrawer
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={updateLeadInState}
                    showToast={showToast}
                />
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {toast.message}
                </div>
            )}
        </div>
    );
};
