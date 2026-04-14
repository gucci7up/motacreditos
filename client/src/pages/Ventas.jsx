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
            <div className="flex justify-between items-center bg-[#1e2541] p-6 rounded-2xl md:rounded-[32px] border border-white/5 shadow-xl">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Ventas</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Historial de Transacciones</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#c5ff41] hover:bg-[#b0e63a] text-black w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                    <ShoppingCart className="w-5 h-5" /> <span className="hidden md:inline">Nueva Venta</span>
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-[#1e2541]/50 rounded-[32px] border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/5">
                            <th className="py-6 px-8">No. Ticket</th>
                            <th className="py-6 px-8">Cliente</th>
                            <th className="py-6 px-8">Fecha</th>
                            <th className="py-6 px-8">Monto</th>
                            <th className="py-6 px-8 text-center">Estado</th>
                            <th className="py-6 px-8 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ventas.map(v => (
                            <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="py-5 px-8 text-[#c5ff41] font-black">#{v.id}</td>
                                <td className="py-5 px-8 text-white font-bold">{v.cliente_nombre}</td>
                                <td className="py-5 px-8 text-slate-400 text-sm">{new Date(v.fecha).toLocaleDateString()}</td>
                                <td className="py-5 px-8 font-black text-white">${parseFloat(v.monto_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td className="py-5 px-8 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${v.estado === 'Pagado' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            v.estado === 'Parcial' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                                'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {v.estado}
                                    </span>
                                </td>
                                <td className="py-5 px-8 text-right">
                                    <button onClick={() => handlePrint(v.id)} className="text-slate-400 hover:text-[#c5ff41] transition p-2 hover:bg-white/5 rounded-xl">
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
                    <div key={v.id} className="bg-[#151a2d] p-5 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-[#c5ff41] font-black text-sm">#{v.id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm ${v.estado === 'Pagado' ? 'bg-green-500 text-black' :
                                            v.estado === 'Parcial' ? 'bg-orange-500 text-black' :
                                                'bg-red-500 text-black'
                                        }`}>
                                        {v.estado}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-white">{v.cliente_nombre}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{new Date(v.fecha).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Monto</p>
                                <p className="text-lg font-black text-white">${parseFloat(v.monto_total).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                            <button onClick={() => handlePrint(v.id)} className="flex items-center space-x-2 text-[10px] font-black uppercase text-[#c5ff41] tracking-widest">
                                <Printer className="w-4 h-4" /> <span>Imprimir Recibo</span>
                            </button>
                        </div>
                    </div>
                ))}
                {ventas.length === 0 && (
                    <div className="bg-[#151a2d]/50 p-10 rounded-2xl border border-dashed border-white/10 text-center">
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">No hay ventas registradas</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#0a0f1d]/90 z-[60] flex justify-center items-center p-4 backdrop-blur-md">
                    <div className="bg-[#1e2541] rounded-[32px] p-8 w-full max-w-md border border-white/10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <ShoppingCart className="w-6 h-6 mr-2 text-[#c5ff41]" /> Registrar Venta
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Cliente</label>
                                <select required value={formData.cliente_id} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })} className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white appearance-none focus:outline-none focus:border-[#c5ff41]/50 focus:ring-1 focus:ring-[#c5ff41]/20 transition-all font-medium">
                                    <option value="" className="bg-[#1e2541]">Seleccione un cliente...</option>
                                    {clientes.map(c => <option key={c.id} value={c.id} className="bg-[#1e2541]">{c.nombre} (Deuda: ${c.saldo_total})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Monto Total ($)</label>
                                <input required type="number" step="0.01" min="0.01" value={formData.monto_total} onChange={e => setFormData({ ...formData, monto_total: e.target.value })} className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c5ff41]/50 focus:ring-1 focus:ring-[#c5ff41]/20 transition-all font-medium" placeholder="0.00" />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 text-slate-400 font-bold hover:bg-white/5 rounded-2xl transition">Cancelar</button>
                                <button type="submit" className="flex-[2] px-6 py-4 bg-[#c5ff41] hover:bg-[#b0e63a] text-black font-black rounded-2xl shadow-xl shadow-[#c5ff41]/10 transition active:scale-95">Guardar Venta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
