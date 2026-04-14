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
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Directorio de Clientes</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow flex items-center space-x-2 transition"
                >
                    <UserPlus className="w-5 h-5" /> <span>Nuevo Cliente</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                            <th className="py-4 px-6 font-medium">Nombre</th>
                            <th className="py-4 px-6 font-medium">Cédula / Teléfono</th>
                            <th className="py-4 px-6 font-medium">Dirección</th>
                            <th className="py-4 px-6 font-medium text-right">Deuda Pendiente</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clientes.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-gray-900 font-bold">{c.nombre}</td>
                                <td className="py-4 px-6 text-gray-600">{c.cedula_telefono}</td>
                                <td className="py-4 px-6 text-gray-500 text-sm truncate max-w-xs">{c.direccion}</td>
                                <td className="py-4 px-6 text-right font-bold text-red-600">
                                    ${parseFloat(c.saldo_total).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        {clientes.length === 0 && (
                            <tr><td colSpan="4" className="py-8 text-center text-gray-500">No se encontraron clientes</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Agregar Cliente</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input required type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / Teléfono</label>
                                <input required type="text" value={formData.cedula_telefono} onChange={e => setFormData({ ...formData, cedula_telefono: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <textarea value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition text-center whitespace-nowrap">Guardar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
