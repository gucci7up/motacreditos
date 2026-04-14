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
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Gestión de Abonos</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium shadow flex items-center space-x-2 transition"
                >
                    <DollarSign className="w-5 h-5" /> <span>Registrar Abono</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-200" />
                <p className="text-lg">Para registrar un pago, haz clic en "Registrar Abono".</p>
                <p className="text-sm mt-2">Los abonos se aplican a tickets específicos (ventas pendientes).</p>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Nuevo Abono</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venta / Ticket</label>
                                <select required value={formData.venta_id} onChange={e => setFormData({ ...formData, venta_id: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Seleccione el ticket a abonar...</option>
                                    {ventasPendientes.map(v => (
                                        <option key={v.id} value={v.id}>
                                            Ticket #{v.id} - {v.cliente_nombre} (${parseFloat(v.monto_total).toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Abonado ($)</label>
                                <input required type="number" step="0.01" min="0.01" value={formData.monto_abonado} onChange={e => setFormData({ ...formData, monto_abonado: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                <select value={formData.metodo_pago} onChange={e => setFormData({ ...formData, metodo_pago: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition">Confirmar Pago</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
