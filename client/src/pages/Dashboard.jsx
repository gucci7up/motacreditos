import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({ totalClientes: 0, totalPorCobrar: 0, ventasRecientes: [] });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [clientesRes, ventasRes] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/ventas')
                ]);

                const totalCobrar = clientesRes.data.reduce((acc, c) => acc + parseFloat(c.saldo_total), 0);

                setStats({
                    totalClientes: clientesRes.data.length,
                    totalPorCobrar: totalCobrar,
                    ventasRecientes: ventasRes.data.slice(0, 5)
                });
            } catch (error) {
                console.error("Error al cargar dashboard", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 flex items-center space-x-4 shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Clientes</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.totalClientes}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 flex items-center space-x-4 shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
                    <div className="bg-red-100 p-4 rounded-full text-red-600">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Cuentas por Cobrar</p>
                        <p className="text-3xl font-bold text-gray-800">${stats.totalPorCobrar.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Recents Vents */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Ventas Recientes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                                <th className="py-4 px-6 font-medium">Ticket #</th>
                                <th className="py-4 px-6 font-medium">Cliente</th>
                                <th className="py-4 px-6 font-medium">Fecha</th>
                                <th className="py-4 px-6 font-medium text-right">Monto</th>
                                <th className="py-4 px-6 font-medium text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.ventasRecientes.map((v) => (
                                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-6 text-gray-800 font-medium">#{v.id}</td>
                                    <td className="py-3 px-6 text-gray-600">{v.cliente_nombre}</td>
                                    <td className="py-3 px-6 text-gray-500 text-sm">{new Date(v.fecha).toLocaleDateString()}</td>
                                    <td className="py-3 px-6 text-right font-bold text-gray-800">${parseFloat(v.monto_total).toFixed(2)}</td>
                                    <td className="py-3 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${v.estado === 'Pagado' ? 'bg-green-100 text-green-700' :
                                                v.estado === 'Parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {v.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {stats.ventasRecientes.length === 0 && (
                                <tr><td colSpan="5" className="py-8 text-center text-gray-500">No hay ventas recientes</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
