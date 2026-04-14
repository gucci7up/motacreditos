import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Printer } from 'lucide-react';

export default function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ cliente_id: '', monto_total: '' });

    const fetchData = async () => {
        try {
            const [vRes, cRes] = await Promise.all([api.get('/ventas'), api.get('/clientes')]);
            setVentas(vRes.data);
            setClientes(cRes.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/ventas', formData);
            setIsModalOpen(false);
            setFormData({ cliente_id: '', monto_total: '' });
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
        <div className="space-y-6 max-w-5xl">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Ventas</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Historial de Transacciones</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-rose-200 flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                    <ShoppingCart className="w-5 h-5" /> <span className="hidden md:inline">Nueva Venta</span>
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-50">
                            <th className="py-6 px-8">No. Ticket</th>
                            <th className="py-6 px-8">Cliente</th>
                            <th className="py-6 px-8">Fecha</th>
                            <th className="py-6 px-8">Monto</th>
                            <th className="py-6 px-8 text-center">Estado</th>
                            <th className="py-6 px-8 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {ventas.map(v => (
                            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="py-5 px-8 text-indigo-600 font-black">#{v.id}</td>
                                <td className="py-5 px-8 text-slate-700 font-bold">{v.cliente_nombre}</td>
                                <td className="py-5 px-8 text-slate-400 text-sm">{new Date(v.fecha).toLocaleDateString()}</td>
                                <td className="py-5 px-8 font-black text-slate-900">${parseFloat(v.monto_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td className="py-5 px-8 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${v.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        v.estado === 'Parcial' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                            'bg-rose-50 text-rose-600 border border-rose-100'
                                        }`}>
                                        {v.estado}
                                    </span>
                                </td>
                                <td className="py-5 px-8 text-right">
                                    <button onClick={() => handlePrint(v.id)} className="text-slate-400 hover:text-indigo-600 transition p-2 hover:bg-slate-100 rounded-xl">
                                        <Printer className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {ventas.map(v => (
                    <div key={v.id} className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-indigo-600 font-black text-sm">#{v.id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm ${v.estado === 'Pagado' ? 'bg-emerald-500 text-white' :
                                        v.estado === 'Parcial' ? 'bg-amber-500 text-white' :
                                            'bg-rose-500 text-white'
                                        }`}>
                                        {v.estado}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-900">{v.cliente_nombre}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{new Date(v.fecha).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Monto</p>
                                <p className="text-lg font-black text-slate-900">${parseFloat(v.monto_total).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                            <button onClick={() => handlePrint(v.id)} className="flex items-center space-x-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                                <Printer className="w-4 h-4" /> <span>Imprimir Recibo</span>
                            </button>
                        </div>
                    </div>
                ))}
                {ventas.length === 0 && (
                    <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">No hay ventas registradas</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                            <ShoppingCart className="w-6 h-6 mr-2 text-indigo-600" /> Registrar Venta
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Cliente</label>
                                <select required value={formData.cliente_id} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-medium">
                                    <option value="" className="bg-white">Seleccione un cliente...</option>
                                    {clientes.map(c => <option key={c.id} value={c.id} className="bg-white">{c.nombre} (Deuda: ${c.saldo_total})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Monto Total ($)</label>
                                <input required type="number" step="0.01" min="0.01" value={formData.monto_total} onChange={e => setFormData({ ...formData, monto_total: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-medium" placeholder="0.00" />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition">Cancelar</button>
                                <button type="submit" className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition active:scale-95">Guardar Venta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
