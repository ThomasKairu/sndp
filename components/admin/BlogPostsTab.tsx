import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../types';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../../services/dataService';
import { Plus, Search, Edit2, Trash2, X, Save, Image as ImageIcon, Loader2, Link } from 'lucide-react';

export const BlogPostsTab: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<BlogPost>>({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setIsLoading(true);
        const data = await getBlogPosts();
        setPosts(data);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                const updated = await updateBlogPost(editingId, formData);
                setPosts(prev => prev.map(p => p.id === editingId ? { ...p, ...updated } : p));
            } else {
                // Create
                // Auto-generate ID from title slug if not present (simple version)
                const newId = formData.id || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `blog-${Date.now()}`;
                const newPost = {
                    ...formData,
                    id: newId,
                    date: formData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                } as BlogPost;
                await createBlogPost(newPost);
                setPosts(prev => [newPost, ...prev]);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({});
        } catch (error) {
            console.error('Failed to save post:', error);
            alert('Failed to save post');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await deleteBlogPost(id);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post');
        }
    };

    const openEditModal = (post: BlogPost) => {
        setEditingId(post.id);
        setFormData({ ...post });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            category: 'News',
            image: '/placeholder-blog.webp'
        });
        setIsModalOpen(true);
    };

    // Filter posts
    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Blog Posts</h2>
                    <p className="text-slate-500 text-sm">Manage news and articles</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <Plus size={18} /> Add Post
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search titles or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center flex justify-center">
                        <Loader2 className="animate-spin text-brand-600" size={32} />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Article</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Category</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="hover:bg-blue-50/30 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url("${post.image}")` }}></div>
                                            <div>
                                                <div className="font-medium text-slate-800 line-clamp-1 max-w-[300px]">{post.title}</div>
                                                <div className="text-xs text-gray-500">{post.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{post.date}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(post)}
                                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold font-serif">{editingId ? 'Edit Article' : 'Write New Article'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Article Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-lg font-medium"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter a catchy title..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug / ID</label>
                                    <div className="relative">
                                        <Link size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm font-mono text-gray-600"
                                            value={formData.id || ''}
                                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                                            placeholder="auto-generated-slug"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.category || 'News'}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="News">News</option>
                                        <option value="Legal & Tech">Legal & Tech</option>
                                        <option value="Education">Education</option>
                                        <option value="Investment">Investment</option>
                                        <option value="Guides">Guides</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Excerpt</label>
                                <textarea
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.excerpt || ''}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Brief summary used on the card..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
                                <textarea
                                    rows={10}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
                                    value={formData.content || ''}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="# Write your article content here..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.image || ''}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="/path/to/image.webp"
                                    />
                                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex-shrink-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url("${formData.image}")` }}>
                                        {!formData.image && <ImageIcon className="m-auto mt-3 text-gray-400" size={20} />}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold shadow-md transition flex items-center gap-2"
                                >
                                    <Save size={18} /> Publish Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
