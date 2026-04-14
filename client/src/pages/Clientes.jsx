import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus } from 'lucide-react';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', cedula_telefono: '', direccion: '' });

    const fetchClientes = async () => {
        try {
            const res = await api.get('/clientes');
            setClientes(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchClientes(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/clientes', formData);
            setIsModalOpen(false);
            setFormData({ nombre: '', cedula_telefono: '', direccion: '' });
            fetchClientes();
        } catch (e) {
            console.error(e);
            alert('Error creando cliente');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex justify-between items-center bg-[#1e2541] p-6 rounded-2xl md:rounded-[32px] border border-white/5 shadow-xl">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Directorio</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Gestión de Clientes</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#c5ff41] hover:bg-[#b0e63a] text-black w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                    <UserPlus className="w-5 h-5" /> <span className="hidden md:inline">Nuevo Cliente</span>
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-[#1e2541]/50 rounded-[32px] border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/5">
                            <th className="py-6 px-8">Nombre</th>
                            <th className="py-6 px-8">Contacto</th>
                            <th className="py-6 px-8">Dirección</th>
                            <th className="py-6 px-8 text-right">Deuda</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {clientes.map(c => (
                            <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="py-5 px-8 text-white font-bold group-hover:text-[#c5ff41] transition-colors">{c.nombre}</td>
                                <td className="py-5 px-8 text-slate-400 text-sm font-medium">{c.cedula_telefono}</td>
                                <td className="py-5 px-8 text-slate-500 text-sm max-w-xs truncate">{c.direccion}</td>
                                <td className="py-5 px-8 text-right font-black text-red-500">
                                    ${parseFloat(c.saldo_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {clientes.map(c => (
                    <div key={c.id} className="bg-[#151a2d] p-5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5">{c.nombre}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{c.cedula_telefono}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Saldo</p>
                                <p className="text-sm font-black text-red-500">${parseFloat(c.saldo_total).toFixed(2)}</p>
                            </div>
                        </div>
                        {c.direccion && (
                            <div className="pt-2 border-t border-white/5">
                                <p className="text-[10px] text-slate-400 leading-relaxed italic">"{c.direccion}"</p>
                            </div>
                        )}
                    </div>
                ))}
                {clientes.length === 0 && (
                    <div className="bg-[#151a2d]/50 p-10 rounded-2xl border border-dashed border-white/10 text-center">
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">No hay clientes registrados</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#0a0f1d]/90 z-[60] flex justify-center items-center p-4 backdrop-blur-md">
                    <div className="bg-[#1e2541] rounded-[32px] p-8 w-full max-w-md border border-white/10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <UserPlus className="w-6 h-6 mr-2 text-[#c5ff41]" /> Agregar Cliente
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Nombre Completo</label>
                                <input required type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c5ff41]/50 focus:ring-1 focus:ring-[#c5ff41]/20 transition-all font-medium" placeholder="Ej: Juan Pérez" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Cédula / Teléfono</label>
                                <input required type="text" value={formData.cedula_telefono} onChange={e => setFormData({ ...formData, cedula_telefono: e.target.value })} className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c5ff41]/50 focus:ring-1 focus:ring-[#c5ff41]/20 transition-all font-medium" placeholder="809-XXX-XXXX" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Dirección (Opcional)</label>
                                <textarea value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c5ff41]/50 focus:ring-1 focus:ring-[#c5ff41]/20 transition-all font-medium resize-none" rows="2" placeholder="Ubicación o referencia" />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 text-slate-400 font-bold hover:bg-white/5 rounded-2xl transition">Cancelar</button>
                                <button type="submit" className="flex-[2] px-6 py-4 bg-[#c5ff41] hover:bg-[#b0e63a] text-black font-black rounded-2xl shadow-xl shadow-[#c5ff41]/10 transition active:scale-95">Guardar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
