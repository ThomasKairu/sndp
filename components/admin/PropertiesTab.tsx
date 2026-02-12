import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../../services/dataService';
import { Plus, Search, Edit2, Trash2, X, Save, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';

export const PropertiesTab: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Property>>({
        type: 'Land',
        status: 'For Sale',
        features: []
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setIsLoading(true);
        const data = await getProperties();
        setProperties(data);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                const updated = await updateProperty(editingId, formData);
                setProperties(prev => prev.map(p => p.id === editingId ? { ...p, ...updated } : p));
            } else {
                // Create
                const newId = `p${Date.now()}`;
                const newProperty = {
                    ...formData,
                    id: newId,
                    images: formData.image ? [formData.image] : []
                } as Property;
                await createProperty(newProperty);
                setProperties(prev => [newProperty, ...prev]);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ type: 'Land', status: 'For Sale', features: [] });
        } catch (error) {
            console.error('Failed to save property:', error);
            alert('Failed to save property');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;
        try {
            await deleteProperty(id);
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete property:', error);
            alert('Failed to delete property');
        }
    };

    const openEditModal = (property: Property) => {
        setEditingId(property.id);
        setFormData({ ...property });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            type: 'Land',
            status: 'For Sale',
            features: [],
            image: '/placeholder-property.webp'
        });
        setIsModalOpen(true);
    };

    // Filter properties
    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
                    <p className="text-slate-500 text-sm">Manage your property listings</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <Plus size={18} /> Add Property
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by title or location..."
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
                                <th className="p-4 text-sm font-semibold text-gray-600">Property</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Price</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Type</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProperties.map(property => (
                                <tr key={property.id} className="hover:bg-blue-50/30 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 bg-cover bg-center" style={{ backgroundImage: `url("${property.image}")` }}></div>
                                            <div>
                                                <div className="font-medium text-slate-800">{property.title}</div>
                                                <div className="text-xs text-gray-500">{property.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-700">
                                        KES {property.price.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{property.type}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${property.status === 'For Sale' ? 'bg-green-100 text-green-700' :
                                            property.status === 'Sold' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {property.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(property)}
                                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(property.id)}
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold font-serif">{editingId ? 'Edit Property' : 'Add New Property'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.title || ''}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.price || ''}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.location || ''}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 50x100"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.size || ''}
                                        onChange={e => setFormData({ ...formData, size: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.type || 'Land'}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="Land">Land</option>
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.status || 'For Sale'}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="For Sale">For Sale</option>
                                        <option value="Sold">Sold</option>
                                        <option value="Reserved">Reserved</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                            value={formData.image || ''}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="Image URL or Upload..."
                                        />
                                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex-shrink-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url("${formData.image}")` }}>
                                            {!formData.image && <ImageIcon className="m-auto mt-3 text-gray-400" size={20} />}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                            <ImageIcon size={16} />
                                            Upload from Device
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    if (file.size > 5 * 1024 * 1024) {
                                                        alert("File size must be less than 5MB");
                                                        return;
                                                    }

                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const img = new Image();
                                                        img.src = reader.result as string;
                                                        img.onload = () => {
                                                            const canvas = document.createElement('canvas');
                                                            const MAX_WIDTH = 800;
                                                            if (img.width > MAX_WIDTH) {
                                                                const scaleSize = MAX_WIDTH / img.width;
                                                                canvas.width = MAX_WIDTH;
                                                                canvas.height = img.height * scaleSize;
                                                            } else {
                                                                canvas.width = img.width;
                                                                canvas.height = img.height;
                                                            }

                                                            const ctx = canvas.getContext('2d');
                                                            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                                                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                                                            setFormData(icon => ({ ...icon, image: compressedBase64 }));
                                                        };
                                                    };
                                                    reader.readAsDataURL(file);
                                                }}
                                            />
                                        </label>
                                        <span className="text-xs text-gray-400">Max 5MB (Auto-compressed)</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Use images from <code>/public/</code>, external URLs, or upload directly.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Features (Comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.features?.join(', ') || ''}
                                    onChange={e => setFormData({ ...formData, features: e.target.value.split(',').map(s => s.trim()) })}
                                />
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
                                    <Save size={18} /> Save Property
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
