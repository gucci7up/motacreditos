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
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Registro de Ventas</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow flex items-center space-x-2 transition"
                >
                    <ShoppingCart className="w-5 h-5" /> <span>Nueva Venta</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                            <th className="py-4 px-6 font-medium">No. Ticket</th>
                            <th className="py-4 px-6 font-medium">Cliente</th>
                            <th className="py-4 px-6 font-medium">Fecha</th>
                            <th className="py-4 px-6 font-medium">Monto</th>
                            <th className="py-4 px-6 font-medium text-center">Estado</th>
                            <th className="py-4 px-6 font-medium text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ventas.map(v => (
                            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-gray-900 font-bold">#{v.id}</td>
                                <td className="py-4 px-6 text-gray-600">{v.cliente_nombre}</td>
                                <td className="py-4 px-6 text-gray-500 text-sm">{new Date(v.fecha).toLocaleDateString()}</td>
                                <td className="py-4 px-6 font-bold text-gray-800">${parseFloat(v.monto_total).toFixed(2)}</td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${v.estado === 'Pagado' ? 'bg-green-100 text-green-700' :
                                            v.estado === 'Parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {v.estado}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button onClick={() => handlePrint(v.id)} className="text-gray-500 hover:text-indigo-600 transition" title="Imprimir Recibo">
                                        <Printer className="w-5 h-5 mx-auto" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {ventas.length === 0 && (
                            <tr><td colSpan="6" className="py-8 text-center text-gray-500">No se encontraron ventas</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Registrar Venta</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                <select required value={formData.cliente_id} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Seleccione un cliente...</option>
                                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} (Deuda: ${c.saldo_total})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total ($)</label>
                                <input required type="number" step="0.01" min="0.01" value={formData.monto_total} onChange={e => setFormData({ ...formData, monto_total: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
