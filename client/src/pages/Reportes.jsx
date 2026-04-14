import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, ChevronRight, Download, Calendar } from 'lucide-react';

export default function Reportes() {
    const [stats, setStats] = useState({ total_ventas: 0, count_ventas: 0, total_pagos: 0, deuda_total: 0 });
    const [series, setSeries] = useState([]);
    const [topProductos, setTopProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resStats, resSeries, resTop] = await Promise.all([
                    api.get('/reportes/stats'),
                    api.get('/reportes/series'),
                    api.get('/reportes/top-productos')
                ]);
                setStats(resStats.data);
                setSeries(resSeries.data);
                setTopProductos(resTop.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#e11d48', '#4f46e5', '#10b981', '#f59e0b', '#8b5cf6'];

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Ventas Totales', value: `$${stats.total_ventas.toLocaleString()}`, icon: ShoppingBag, color: 'rose' },
                    { label: 'Recaudado (Abonos)', value: `$${stats.total_pagos.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
                    { label: 'Cuentas por Cobrar', value: `$${stats.deuda_total.toLocaleString()}`, icon: TrendingUp, color: 'amber' },
                    { label: 'Volumen Ventas', value: stats.count_ventas, icon: Users, color: 'indigo' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Sales Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Desempeño de Ventas</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ventas vs Recaudación (Últimos 30 días)</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                            <Calendar className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={series}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPagos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="fecha"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                <Area type="monotone" dataKey="ventas" name="Ventas ($)" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                                <Area type="monotone" dataKey="pagos" name="Recaudado ($)" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorPagos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Más Vendidos</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Top perfumes esta temporada</p>

                        <div className="space-y-6">
                            {topProductos.map((prod, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs shadow-inner">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase truncate">{prod.name}</h4>
                                        <div className="flex justify-between items-center mt-1">
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full mr-4">
                                                <div
                                                    className="bg-rose-500 h-full rounded-full"
                                                    style={{ width: `${(prod.vendido / topProductos[0]?.vendido) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500">{prod.vendido} un.</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors">
                            <span>Ver Listado Completo</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-50" />
                </div>
            </div>

            {/* Product Performance Bar Chart */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Ingresos por Producto</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Comparativa de recaudación por top perfumes</p>
                    </div>
                    <button className="flex items-center space-x-2 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">
                        <Download className="w-4 h-4" />
                        <span>Exportar PDF</span>
                    </button>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProductos}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="monto" name="Ingresos ($)" radius={[10, 10, 0, 0]}>
                                {topProductos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
