import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { DollarSign } from 'lucide-react';

export default function Pagos() {
    const [ventasPendientes, setVentasPendientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ venta_id: '', monto_abonado: '', metodo_pago: 'Efectivo' });

    const fetchVentas = async () => {
        try {
            const res = await api.get('/ventas');
            setVentasPendientes(res.data.filter(v => v.estado !== 'Pagado'));
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchVentas(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pagos', formData);
            setIsModalOpen(false);
            setFormData({ venta_id: '', monto_abonado: '', metodo_pago: 'Efectivo' });
            fetchVentas();
        } catch (e) {
            console.error(e);
            alert('Error registrando abono');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Abonos</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cobros y Pagos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-rose-200 flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                    <DollarSign className="w-5 h-5" /> <span className="hidden md:inline">Registrar Abono</span>
                </button>
            </div>

            <div className="bg-white p-10 md:p-16 rounded-[24px] md:rounded-[40px] border border-slate-100 flex flex-col items-center text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-50 rounded-[32px] flex items-center justify-center border border-rose-100 mb-2">
                    <DollarSign className="w-10 h-10 md:w-12 md:h-12 text-rose-600" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">Centro de Recaudación</h3>
                <p className="text-xs md:text-sm text-slate-500 max-w-xs font-medium leading-relaxed">
                    Registra pagos parciales o totales de tus ventas pendientes. El sistema actualizará automáticamente la deuda del cliente.
                </p>
                <div className="pt-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-[10px] md:text-xs font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-6 py-3 rounded-full hover:bg-indigo-100 transition-all border border-indigo-100"
                    >
                        Empezar Cobro Now
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                            <DollarSign className="w-6 h-6 mr-2 text-indigo-600" /> Nuevo Abono
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Venta / Ticket Pendiente</label>
                                <select required value={formData.venta_id} onChange={e => setFormData({ ...formData, venta_id: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-medium">
                                    <option value="" className="bg-white">Seleccione el ticket...</option>
                                    {ventasPendientes.map(v => (
                                        <option key={v.id} value={v.id} className="bg-white">
                                            Ticket #{v.id} - {v.cliente_nombre} (${parseFloat(v.monto_total).toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Monto a Abonar ($)</label>
                                <input required type="number" step="0.01" min="0.01" value={formData.monto_abonado} onChange={e => setFormData({ ...formData, monto_abonado: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-medium" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Método de Cobro</label>
                                <select value={formData.metodo_pago} onChange={e => setFormData({ ...formData, metodo_pago: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-medium">
                                    <option value="Efectivo" className="bg-white">Efectivo</option>
                                    <option value="Transferencia" className="bg-white">Transferencia</option>
                                    <option value="Tarjeta" className="bg-white">Tarjeta</option>
                                </select>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition">Cancelar</button>
                                <button type="submit" className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition active:scale-95">Confirmar Cobro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
