import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Search,
    Filter,
    Download,
    ChevronDown,
    MoreHorizontal,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { getLeads, Lead, getDashboardStats, DashboardStats } from '../services/dataService';
// Mock Data removed


import { PropertiesTab } from '../components/admin/PropertiesTab';
import { BlogPostsTab } from '../components/admin/BlogPostsTab';
import { Home, FileText } from 'lucide-react';

export const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('leads');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');

    // Fetch leads & stats when authenticated and on leads tab
    useEffect(() => {
        if (isAuthenticated && activeTab === 'leads') {
            getLeads()
                .then(data => setLeads(data))
                .catch(err => console.error("Failed to load leads", err));

            getDashboardStats()
                .then(data => setStats(data))
                .catch(err => console.error("Failed to load stats", err));
        }
    }, [isAuthenticated, activeTab]);

    // Secure Auth Handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setIsLoggingIn(true);

        // Store temporarily to test
        const secret = password;

        try {
            // Attempt to fetch specific restricted resource to verify credential
            const response = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/leads?limit=1`, {
                headers: { 'x-internal-secret': secret }
            });

            if (response.ok) {
                // Success: Valid Secret
                localStorage.setItem('admin_secret', secret);
                setIsAuthenticated(true);
                localStorage.setItem('crm_auth', 'true');
            } else {
                // Failed
                setLoginError('Invalid Access Key. Access Denied.');
                localStorage.removeItem('admin_secret');
            }
        } catch (err) {
            setLoginError('Connection Error. Please check your network.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('crm_auth');
        localStorage.removeItem('admin_secret'); // Clear secret on logout
    };

    // On mount: if a secret is stored, re-validate it against the API
    // (Don't blindly trust crm_auth=true — anyone can set that in localStorage)
    useEffect(() => {
        const storedSecret = localStorage.getItem('admin_secret');
        if (!storedSecret) return;

        fetch(`${import.meta.env.VITE_API_BASE || ''}/api/leads?limit=1`, {
            headers: { 'x-internal-secret': storedSecret }
        })
            .then(res => {
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    // Stored secret is no longer valid — clear everything
                    localStorage.removeItem('admin_secret');
                    localStorage.removeItem('crm_auth');
                }
            })
            .catch(() => {
                // Network error — don't auto-authenticate
                localStorage.removeItem('admin_secret');
                localStorage.removeItem('crm_auth');
            });
    }, []);

    // Filter Leads
    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
        return matchesSearch && matchesStatus && matchesSource;
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Helmet>
                    <title>CRM Login | Provision Land</title>
                </Helmet>
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
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        placeholder="Enter secure key..."
                                    />
                                </div>
                                {loginError && (
                                    <div className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        <span>{loginError}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isLoggingIn ? 'Verifying...' : 'Access Dashboard'}
                            </button>
                        </form>
                        <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                            <ShieldCheck size={12} />
                            <span>Protected by 256-bit encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Helmet>
                <title>CRM Dashboard | Provision Land</title>
            </Helmet>

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-serif font-bold text-white">Provision<span className="text-brand-500">CRM</span></h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'leads' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Leads Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('properties')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'properties' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Home size={20} />
                        <span>Properties</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('blog')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'blog' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <FileText size={20} />
                        <span>Blog Posts</span>
                    </button>
                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-slate-400 hover:bg-slate-800`}
                        >
                            <Users size={20} />
                            <span>Customers</span>
                        </button>
                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-slate-400 hover:bg-slate-800`}
                        >
                            <MessageSquare size={20} />
                            <span>Broadcasts</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                {/* Top Header */}
                <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {activeTab === 'leads' ? 'Leads Overview' :
                            activeTab === 'properties' ? 'Property Listings' : 'Blog Management'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                            Running in Production Mode
                        </div>
                        <div className="h-10 w-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                            SA
                        </div>
                    </div>
                </header>

                {activeTab === 'leads' && (
                    <div className="p-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <StatCard title="Total Leads" value={stats?.totalLeads || "..."} icon={<Users size={24} />} color="blue" />
                            <StatCard title="New Today" value={stats?.newToday || "..."} icon={<Calendar size={24} />} color="green" />
                            <StatCard title="Action Required" value={stats?.actionRequired || "..."} icon={<AlertCircle size={24} />} color="red" />
                            <StatCard title="Conversion Rate" value={stats?.conversionRate || "..."} icon={<CheckCircle size={24} />} color="purple" />
                        </div>

                        {/* Filters & Actions */}
                        <div className="bg-white rounded-t-xl p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="all">Status: All</option>
                                        <option value="NEW">New</option>
                                        <option value="CONTACTED">Contacted</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <select
                                        value={sourceFilter}
                                        onChange={(e) => setSourceFilter(e.target.value)}
                                        className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="all">Source: All</option>
                                        <option value="website">Website</option>
                                        <option value="whatsapp">WhatsApp</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                            <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition">
                                <Download size={18} />
                                <span>Export CSV</span>
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border-x border-b border-gray-100">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b border-gray-100">
                                        <th className="p-4">Name & Contact</th>
                                        <th className="p-4">Interest</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-blue-50/50 transition duration-150 group">
                                            <td className="p-4">
                                                <div className="font-medium text-slate-800">{lead.name}</div>
                                                <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-1">
                                                    <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>
                                                    <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-700 font-medium">{lead.interest}</div>
                                                <div className="text-xs text-brand-600 bg-brand-50 inline-block px-1.5 py-0.5 rounded mt-1">{lead.source}</div>
                                                <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{lead.ai_summary || lead.message || "No AI summary available."}</div>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={lead.status} />
                                                {lead.priority === 'high' && (
                                                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">
                                                        <AlertCircle size={10} /> High Priority
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                                                <div className="text-xs text-gray-400">{lead.created_at ? new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                            </td>
                                            <td className="p-4">
                                                <button className="text-gray-400 hover:text-brand-600 transition p-2 hover:bg-brand-50 rounded-full">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredLeads.length === 0 && (
                                <div className="p-12 text-center text-gray-500">
                                    No leads found matching your filters.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'properties' && <PropertiesTab />}
                {activeTab === 'blog' && <BlogPostsTab />}
            </main>
        </div>
    );
};

// Stateless Components for Cleanliness
const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: 'blue' | 'green' | 'red' | 'purple' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                {icon}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles: { [key: string]: string } = {
        new: 'bg-blue-100 text-blue-800 border-blue-200',
        contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        qualified: 'bg-purple-100 text-purple-800 border-purple-200',
        closed: 'bg-green-100 text-green-800 border-green-200',
        lost: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.new}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
