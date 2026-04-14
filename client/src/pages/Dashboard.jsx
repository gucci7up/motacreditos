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
        { label: 'Venta', icon: Plus, color: 'bg-[#c5ff41] text-[#060912]', link: '/ventas' },
        { label: 'Pago', icon: DollarSign, color: 'bg-indigo-500 text-white', link: '/pagos' },
        { label: 'Cliente', icon: Users, color: 'bg-purple-500 text-white', link: '/clientes' },
        { label: 'Reporte', icon: FileText, color: 'bg-slate-700 text-white', link: '/' },
    ];

    return (
        <div className="space-y-6 md:space-y-8 max-w-5xl">
            {/* Hero Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1e2541] to-[#151a2d] rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/5 shadow-2xl group transition-all duration-500 hover:shadow-[#c5ff41]/5">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#c5ff41] opacity-[0.03] blur-[80px] rounded-full group-hover:opacity-[0.05] transition-opacity"></div>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-1">Cuentas por Cobrar</p>
                        <h2 className="text-3xl md:text-5xl font-black text-[#c5ff41] tracking-tighter neon-text">
                            ${stats.totalPorCobrar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-white/5 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm">
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">Total Clientes</p>
                        <p className="text-lg md:text-xl font-bold text-white">{stats.totalClientes}</p>
                    </div>
                    <div className="bg-white/5 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm">
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">Crecimiento</p>
                        <p className="text-lg md:text-xl font-bold text-[#c5ff41] flex items-center">
                            +12% <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 md:gap-4">
                {actions.map((action, i) => (
                    <Link key={i} to={action.link} className="flex flex-col items-center space-y-2 md:space-y-3 group">
                        <div className={`${action.color} p-4 md:p-5 rounded-xl md:rounded-[24px] shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
                            <action.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Recent Transactions Style List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-base md:text-lg font-black tracking-tight text-white">Ventas Recientes</h3>
                    <Link to="/ventas" className="text-[10px] md:text-xs font-bold text-[#c5ff41] hover:underline flex items-center uppercase tracking-widest">
                        Ver Todo <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="space-y-3">
                    {stats.ventasRecientes.map((v) => (
                        <div key={v.id} className="bg-[#151a2d] p-4 md:p-5 rounded-xl md:rounded-[24px] border border-white/5 flex items-center justify-between group hover:bg-[#1e2541] transition-all cursor-pointer">
                            <div className="flex items-center space-x-3 md:space-x-4">
                                <div className={`p-2.5 md:p-3 rounded-lg md:rounded-2xl ${v.estado === 'Pagado' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="max-w-[120px] md:max-w-none">
                                    <p className="text-xs md:text-sm font-bold text-white group-hover:text-[#c5ff41] transition-colors truncate">{v.cliente_nombre}</p>
                                    <p className="text-[9px] md:text-[10px] text-slate-500 font-medium uppercase tracking-wider">{new Date(v.fecha).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm md:text-base font-black text-white">${parseFloat(v.monto_total).toFixed(2)}</p>
                                <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${v.estado === 'Pagado' ? 'text-green-500' : 'text-orange-500'
                                    }`}>{v.estado}</p>
                            </div>
                        </div>
                    ))}
                    {stats.ventasRecientes.length === 0 && (
                        <div className="bg-[#151a2d]/50 p-6 md:p-10 rounded-xl md:rounded-[24px] border border-dashed border-white/10 text-center">
                            <p className="text-slate-500 text-xs md:text-sm font-medium">No hay transacciones recientes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
