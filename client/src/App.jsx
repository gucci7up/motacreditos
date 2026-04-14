import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Users, ShoppingBag, CreditCard, Droplet } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Pagos from './pages/Pagos';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 bg-red-900/20 border border-red-500 rounded-3xl text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Algo salió mal</h2>
                    <p className="text-sm text-red-300">{this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold">
                        Recargar Aplicación
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function Sidebar({ activePath }) {
    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/clientes', label: 'Clientes', icon: Users },
        { path: '/ventas', label: 'Ventas', icon: ShoppingBag },
        { path: '/pagos', label: 'Abonos', icon: CreditCard },
    ];

    return (
        <div className="hidden md:flex w-64 bg-white text-slate-600 flex-col h-screen border-r border-slate-200 shadow-xl z-20">
            <div className="p-8">
                <div className="flex items-center space-x-3 mb-10 group cursor-default">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-105 transition-transform">
                        <span className="text-white font-black text-2xl">M</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter">Mota<span className="text-rose-600">Parfum</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Fine Fragrances</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activePath === item.path
                                ? "bg-rose-50 text-rose-600 shadow-sm border border-rose-100"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="p-6 mt-auto">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Versión 2.1</p>
                    <p className="text-[10px] text-slate-500 font-medium">MotaParfum © 2026</p>
                </div>
            </div>
        </div>
    );
}

function BottomNav({ activePath }) {
    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/clientes', label: 'Clientes', icon: Users },
        { path: '/ventas', label: 'Ventas', icon: ShoppingBag },
        { path: '/pagos', label: 'Abonos', icon: CreditCard },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] p-2 shadow-2xl flex justify-between items-center transition-all">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center py-3 px-5 rounded-[24px] transition-all duration-300 ${activePath === item.path
                            ? "bg-indigo-600 text-white scale-105 shadow-lg shadow-indigo-200"
                            : "text-slate-400"
                            }`}
                    >
                        <item.icon className={`w-6 h-6 ${activePath === item.path ? "stroke-[3px]" : ""}`} />
                        <span className={`text-[10px] mt-1 font-bold uppercase tracking-tighter ${activePath === item.path ? "block" : "hidden"}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

function AppLayout() {
    const location = useLocation();

    return (
        <div className="flex bg-[#f8fafc] min-h-screen text-slate-900 selection:bg-indigo-100 relative pb-24 md:pb-0">
            <Sidebar activePath={location.pathname} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="px-6 md:px-10 py-6 md:py-8 flex justify-between items-center z-10 shrink-0">
                    <div className="flex items-center space-x-3 md:block">
                        <div className="md:hidden bg-indigo-600 p-2 rounded-xl shadow-md">
                            <Droplet className="w-5 h-5 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-0.5 md:mb-1">MotaCréditos</p>
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Panel de Gestión</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <button className="p-2.5 md:p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all relative">
                            <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full shadow-sm"></div>
                            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                        </button>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl border-2 border-white shadow-lg shadow-indigo-100"></div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto px-6 md:px-10 pb-10">
                    <ErrorBoundary>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/clientes" element={<Clientes />} />
                            <Route path="/ventas" element={<Ventas />} />
                            <Route path="/pagos" element={<Pagos />} />
                        </Routes>
                    </ErrorBoundary>
                </div>
            </main>
            <BottomNav activePath={location.pathname} />
        </div>
    );
}

export default App;
