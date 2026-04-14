import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    AlertTriangle,
    Image as ImageIcon,
    Tag,
    Layers,
    ArrowUpDown,
    Upload
} from 'lucide-react';

const API_URL = '/api';
const BASE_URL = '';

const Inventario = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formData, setFormData] = useState({
        nombre_perfume: '',
        categoria: '',
        imagen_url: '',
        precio_venta: '',
        stock_actual: '',
        stock_minimo: '5'
    });

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            const res = await axios.get(`${API_URL}/productos`);
            setProductos(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('nombre_perfume', formData.nombre_perfume);
        data.append('categoria', formData.categoria);
        data.append('precio_venta', formData.precio_venta);
        data.append('stock_actual', formData.stock_actual);
        data.append('stock_minimo', formData.stock_minimo);
        data.append('imagen_url', formData.imagen_url); // Enviar URL actual por si no cambia

        if (selectedFile) {
            data.append('imagen', selectedFile);
        }

        try {
            if (editingProduct) {
                await axios.put(`${API_URL}/productos/${editingProduct.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post(`${API_URL}/productos`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setSelectedFile(null);
            setPreviewUrl(null);
            setFormData({ nombre_perfume: '', categoria: '', imagen_url: '', precio_venta: '', stock_actual: '', stock_minimo: '5' });
            fetchProductos();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            nombre_perfume: product.nombre_perfume,
            categoria: product.categoria || '',
            imagen_url: product.imagen_url || '',
            precio_venta: product.precio_venta,
            stock_actual: product.stock_actual,
            stock_minimo: product.stock_minimo
        });
        setPreviewUrl(product.imagen_url ? (product.imagen_url.startsWith('http') ? product.imagen_url : `${BASE_URL}${product.imagen_url}`) : null);
        setIsModalOpen(true);
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    const filtered = productos.filter(p =>
        p.nombre_perfume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center font-bold text-slate-500">Cargando inventario...</div>;

    return (
        <div className="space-y-6 md:space-y-8 pb-32 md:pb-0">
            <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Inventario</h2>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Control de stock y catálogo MotaParfum</p>
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setSelectedFile(null); setPreviewUrl(null); setFormData({ nombre_perfume: '', categoria: '', imagen_url: '', precio_venta: '', stock_actual: '', stock_minimo: '5' }); setIsModalOpen(true); }}
                    className="bg-rose-600 hover:bg-rose-700 text-white w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-rose-200 flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> <span className="hidden md:inline">Agregar Producto</span>
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o categoría..."
                    className="w-full pl-14 pr-8 py-5 rounded-[24px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium text-slate-900 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(product => (
                    <div key={product.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                        <div className="h-48 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                            {product.imagen_url ? (
                                <img src={getImageUrl(product.imagen_url)} alt={product.nombre_perfume} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-slate-200" />
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-rose-600 font-black tracking-tight">${product.precio_venta}</span>
                            </div>
                            {product.stock_actual <= product.stock_minimo && (
                                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-1 animate-pulse">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Bajo Stock</span>
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{product.categoria || 'Sin Categoría'}</span>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{product.nombre_perfume}</h3>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Actual</p>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xl font-black ${product.stock_actual <= product.stock_minimo ? 'text-orange-600' : 'text-slate-900'}`}>{product.stock_actual}</span>
                                        <span className="text-xs text-slate-400 font-bold">unds.</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Mínimo</p>
                                    <span className="text-sm font-bold text-slate-600">{product.stock_minimo}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-rose-600 p-8 text-white relative">
                            <h3 className="text-2xl font-black">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <p className="text-rose-100 font-medium opacity-80 text-sm">Completa los detalles del perfume</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Imagen del Producto</label>
                                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl hover:bg-slate-100 transition-all group relative cursor-pointer overflow-hidden">
                                        {previewUrl ? (
                                            <div className="w-full h-40 relative group">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-rose-500 transition-colors" />
                                                <p className="text-xs font-bold text-slate-400">Click para subir foto</p>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Perfume</label>
                                    <input
                                        type="text" required
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold"
                                        value={formData.nombre_perfume}
                                        onChange={e => setFormData({ ...formData, nombre_perfume: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold"
                                        placeholder="Ej: Damas, Caballeros"
                                        value={formData.categoria}
                                        onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Precio Venta</label>
                                    <input
                                        type="number" required step="0.01"
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold"
                                        value={formData.precio_venta}
                                        onChange={e => setFormData({ ...formData, precio_venta: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Stock Actual</label>
                                    <input
                                        type="number" required
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold"
                                        value={formData.stock_actual}
                                        onChange={e => setFormData({ ...formData, stock_actual: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Stock Mínimo</label>
                                    <input
                                        type="number" required
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold"
                                        value={formData.stock_minimo}
                                        onChange={e => setFormData({ ...formData, stock_minimo: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                                >
                                    {editingProduct ? 'GUARDAR' : 'CREAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventario;
