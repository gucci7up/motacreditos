import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { DollarSign, History, AlertCircle, CheckCircle2, Receipt, Search } from 'lucide-react';

export default function Pagos() {
    const [ventasPendientes, setVentasPendientes] = useState([]);
    const [historialPagos, setHistorialPagos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ venta_id: '', monto_abonado: '', metodo_pago: 'Efectivo' });

    const fetchData = async () => {
        try {
            const [resVentas, resPagos] = await Promise.all([
                api.get('/ventas'),
                api.get('/pagos')
            ]);
            setVentasPendientes(resVentas.data.filter(v => v.saldo_pendiente > 0));
            setHistorialPagos(resPagos.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/pagos', formData);
            const newPagoId = res.data.id;
            setIsModalOpen(false);
            setFormData({ venta_id: '', monto_abonado: '', metodo_pago: 'Efectivo' });
            fetchData();

            // Sugerir impresión después de un registro exitoso
            if (newPagoId && window.confirm('¡Abono registrado! ¿Desea imprimir el comprobante?')) {
                handlePrint(newPagoId, 'pago');
            }
        } catch (e) {
            console.error(e);
            alert('Error registrando abono');
        }
    };

    const handlePrint = (id, type = 'venta') => {
        const endpoint = type === 'pago' ? `/pagos/${id}/recibo` : `/ventas/${id}/recibo`;
        window.open(`${api.defaults.baseURL}${endpoint}`, '_blank');
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Cobros</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de créditos y abonos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 flex items-center justify-center space-x-2 transition-all active:scale-95 group"
                >
                    <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Registrar Nuevo Abono</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: List of Pending Sales */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-rose-500" /> Cuentas Pendientes
                        </h3>
                        <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-1 rounded-md">{ventasPendientes.length}</span>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                        />
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {ventasPendientes
                            .filter(v => v.cliente_nombre.toLowerCase().includes(search.toLowerCase()))
                            .map(venta => (
                                <div
                                    key={venta.id}
                                    onClick={() => {
                                        setFormData({ ...formData, venta_id: venta.id, monto_abonado: venta.saldo_pendiente });
                                        setIsModalOpen(true);
                                    }}
                                    className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute right-0 top-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md uppercase">Ticket #{venta.id}</span>
                                        <span className="text-rose-600 font-black text-sm">${parseFloat(venta.saldo_pendiente).toFixed(2)}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-sm truncate">{venta.cliente_nombre}</h4>
                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Total Venta</p>
                                            <p className="text-xs font-bold text-slate-500">${parseFloat(venta.monto_total).toFixed(2)}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePrint(venta.id); }}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                                title="Imprimir ticket de deuda"
                                            >
                                                <Receipt className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Right Column: Collection History */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest px-4 flex items-center">
                        <History className="w-4 h-4 mr-2 text-indigo-500" /> Historial de Recaudación
                    </h3>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-bottom border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ticket</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Método</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {historialPagos.map(pago => (
                                        <tr key={pago.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-700">{new Date(pago.fecha_pago).toLocaleDateString()}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(pago.fecha_pago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-900 uppercase truncate max-w-[150px]">{pago.cliente_nombre}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-md">#{pago.venta_id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pago.metodo_pago === 'Efectivo' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {pago.metodo_pago}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-black text-slate-900">${parseFloat(pago.monto_abonado).toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handlePrint(pago.id, 'pago')}
                                                    className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                    title="Imprimir comprobante de abono"
                                                >
                                                    <Receipt className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Recording Abono */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-[60] flex justify-center items-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[40px] p-8 w-full max-w-md border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in slide-in-from-bottom-5 duration-300">
                        <div className="w-16 h-16 bg-rose-50 rounded-[24px] flex items-center justify-center mb-6">
                            <DollarSign className="w-8 h-8 text-rose-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Registrar Cobro</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Información de Abono</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Concepto / Ticket</label>
                                <select
                                    required
                                    value={formData.venta_id}
                                    onChange={e => setFormData({ ...formData, venta_id: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Seleccione un ticket pendiente...</option>
                                    {ventasPendientes.map(v => (
                                        <option key={v.id} value={v.id}>
                                            #{v.id} - {v.cliente_nombre} (Debe: ${parseFloat(v.saldo_pendiente).toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Monto a Cobrar ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.monto_abonado}
                                        onChange={e => setFormData({ ...formData, monto_abonado: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-black text-lg"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {['Efectivo', 'Tarjeta', 'Transferencia'].map(metodo => (
                                    <button
                                        key={metodo}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, metodo_pago: metodo })}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${formData.metodo_pago === metodo
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {metodo}
                                    </button>
                                ))}
                            </div>

                            <div className="flex space-x-3 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl transition">Cerrar</button>
                                <button type="submit" className="flex-[2] px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-rose-200 transition active:scale-95">Confirmar Cobro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
