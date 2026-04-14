import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Printer, Package, User, Hash, AlertCircle } from 'lucide-react';

export default function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        cliente_id: '',
        producto_id: '',
        cantidad: 1,
        monto_total: ''
    });

    const fetchData = async () => {
        try {
            const [vRes, cRes, pRes] = await Promise.all([
                api.get('/ventas'),
                api.get('/clientes'),
                api.get('/productos')
            ]);
            setVentas(vRes.data);
            setClientes(cRes.data);
            setProductos(pRes.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    // Auto-calculo de monto total al seleccionar producto y cantidad
    useEffect(() => {
        if (formData.producto_id && formData.cantidad) {
            const prod = productos.find(p => p.id === parseInt(formData.producto_id));
            if (prod) {
                setFormData(prev => ({ ...prev, monto_total: (prod.precio_venta * formData.cantidad).toFixed(2) }));
            }
        }
    }, [formData.producto_id, formData.cantidad, productos]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar stock antes de enviar
        const prod = productos.find(p => p.id === parseInt(formData.producto_id));
        if (prod && prod.stock_actual < formData.cantidad) {
            alert(`Stock insuficiente. Solo quedan ${prod.stock_actual} unidades.`);
            return;
        }

        try {
            await api.post('/ventas', formData);
            setIsModalOpen(false);
            setFormData({ cliente_id: '', producto_id: '', cantidad: 1, monto_total: '' });
            fetchData();
        } catch (e) {
            console.error(e);
            alert('Error creando venta');
        }
    };

    const handlePrint = (id) => {
        window.open(`${api.defaults.baseURL}/ventas/${id}/recibo`, '_blank', 'width=400,height=600');
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-32 md:pb-0">
            <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Ventas</h2>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Registro de abonos y nuevas fragancias</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-rose-200 flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                    <ShoppingCart className="w-5 h-5" /> <span className="hidden md:inline">Registrar Venta</span>
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <th className="py-6 px-8">No. Ticket</th>
                            <th className="py-6 px-8">Cliente</th>
                            <th className="py-6 px-8">Fecha</th>
                            <th className="py-6 px-8">Monto</th>
                            <th className="py-6 px-8 text-center">Estado</th>
                            <th className="py-6 px-8 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {ventas.map(v => (
                            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="py-6 px-8 text-rose-600 font-black">#{v.id}</td>
                                <td className="py-6 px-8 text-slate-700 font-bold">{v.cliente_nombre}</td>
                                <td className="py-6 px-8 text-slate-400 text-sm font-medium">{new Date(v.fecha).toLocaleDateString()}</td>
                                <td className="py-6 px-8 font-black text-slate-900">${parseFloat(v.monto_total).toLocaleString()}</td>
                                <td className="py-6 px-8 text-center">
                                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${v.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            v.estado === 'Parcial' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                        {v.estado}
                                    </span>
                                </td>
                                <td className="py-6 px-8 text-right">
                                    <button onClick={() => handlePrint(v.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                                        <Printer className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {ventas.map(v => (
                    <div key={v.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-rose-600 font-black">#{v.id}</span>
                                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${v.estado === 'Pagado' ? 'bg-emerald-100 text-emerald-700' :
                                            v.estado === 'Parcial' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                        }`}>
                                        {v.estado}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-900">{v.cliente_nombre}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(v.fecha).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xl font-black text-slate-900">${parseFloat(v.monto_total).toFixed(2)}</p>
                        </div>
                        <button onClick={() => handlePrint(v.id)} className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold flex items-center justify-center space-x-2 active:bg-slate-100 transition-colors">
                            <Printer className="w-4 h-4" /> <span>IMPRIMIR RECIBO</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal de Registro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-rose-600 p-8 text-white relative">
                            <ShoppingCart className="absolute top-8 right-8 w-12 h-12 text-white/20" />
                            <h3 className="text-2xl font-black">Registrar Venta</h3>
                            <p className="text-rose-100 font-medium opacity-80 text-sm">Venta a crédito de fragancias</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select required
                                        value={formData.cliente_id}
                                        onChange={e => setFormData({ ...formData, cliente_id: e.target.value })}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-rose-500/10 appearance-none transition-all"
                                    >
                                        <option value="">Seleccione un cliente...</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} (Debiendo: ${c.saldo_total})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfume / Fragancia</label>
                                <div className="relative">
                                    <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select required
                                        value={formData.producto_id}
                                        onChange={e => setFormData({ ...formData, producto_id: e.target.value })}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-rose-500/10 appearance-none transition-all"
                                    >
                                        <option value="">Seleccione el perfume...</option>
                                        {productos.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.stock_actual <= 0}>
                                                {p.nombre_perfume} - ${p.precio_venta} ({p.stock_actual} en stock)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad</label>
                                    <div className="relative">
                                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input required type="number" min="1"
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-rose-500/10 transition-all"
                                            value={formData.cantidad}
                                            onChange={e => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total a Pagar</label>
                                    <div className="w-full px-5 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center">
                                        ${formData.monto_total || '0.00'}
                                    </div>
                                </div>
                            </div>

                            {formData.producto_id && productos.find(p => p.id === parseInt(formData.producto_id))?.stock_actual < formData.cantidad && (
                                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-start space-x-3 border border-rose-100">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold leading-relaxed">No hay suficiente stock para esta cantidad. Intenta con un número menor.</p>
                                </div>
                            )}

                            <div className="flex space-x-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">CANCELAR</button>
                                <button type="submit" className="flex-[2] py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95">GUARDAR VENTA</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
