import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, TrendingUp, DollarSign, Plus, ArrowUpRight, ArrowDownLeft, FileText, ChevronRight, ShoppingBag } from 'lucide-react';

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

    const actions = [
        { label: 'Venta', icon: Plus, color: 'bg-indigo-600 text-white', link: '/ventas' },
        { label: 'Pago', icon: DollarSign, color: 'bg-blue-500 text-white', link: '/pagos' },
        { label: 'Cliente', icon: Users, color: 'bg-indigo-400 text-white', link: '/clientes' },
        { label: 'Reporte', icon: FileText, color: 'bg-slate-700 text-white', link: '/' },
    ];

    return (
        <div className="space-y-6 md:space-y-8 max-w-5xl">
            {/* Hero Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-red-600 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl shadow-rose-100 group transition-all duration-500">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-[0.1] blur-[80px] rounded-full group-hover:opacity-[0.15] transition-opacity"></div>

                <div className="flex justify-between items-start mb-10">
                    <div>
                        <p className="text-rose-100 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-1">Cuentas por Cobrar</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                            ${stats.totalPorCobrar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm">
                        <p className="text-rose-100/70 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">Total Clientes</p>
                        <p className="text-lg md:text-xl font-bold text-white">{stats.totalClientes}</p>
                    </div>
                    <div className="bg-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm">
                        <p className="text-rose-100/70 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">Crecimiento</p>
                        <p className="text-lg md:text-xl font-bold text-white flex items-center">
                            +12% <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-1 opacity-80" />
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 md:gap-4">
                {actions.map((action, i) => (
                    <Link key={i} to={action.link} className="flex flex-col items-center space-y-2 md:space-y-3 group">
                        <div className={`${action.color} p-4 md:p-5 rounded-xl md:rounded-[24px] shadow-lg shadow-indigo-100 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
                            <action.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Recent Transactions Style List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-base md:text-lg font-black tracking-tight text-slate-900">Ventas Recientes</h3>
                    <Link to="/ventas" className="text-[10px] md:text-xs font-bold text-indigo-600 hover:underline flex items-center uppercase tracking-widest">
                        Ver Todo <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="space-y-3">
                    {stats.ventasRecientes.map((v) => (
                        <div key={v.id} className="bg-white p-4 md:p-5 rounded-xl md:rounded-[24px] border border-slate-100 flex items-center justify-between group hover:border-indigo-100 hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer">
                            <div className="flex items-center space-x-3 md:space-x-4">
                                <div className={`p-2.5 md:p-3 rounded-lg md:rounded-2xl ${v.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="max-w-[120px] md:max-w-none">
                                    <p className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{v.cliente_nombre}</p>
                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-medium uppercase tracking-wider">{new Date(v.fecha).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm md:text-base font-black text-slate-900">${parseFloat(v.monto_total).toFixed(2)}</p>
                                <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${v.estado === 'Pagado' ? 'text-emerald-500' : 'text-amber-500'
                                    }`}>{v.estado}</p>
                            </div>
                        </div>
                    ))}
                    {stats.ventasRecientes.length === 0 && (
                        <div className="bg-slate-50 p-6 md:p-10 rounded-xl md:rounded-[24px] border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 text-xs md:text-sm font-medium">No hay transacciones recientes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
