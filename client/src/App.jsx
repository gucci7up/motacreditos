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
        <div className="hidden md:flex w-64 bg-[#0A0E21] text-white flex-col h-screen border-r border-white/5 shadow-2xl z-20">
            <div className="p-8 flex items-center space-x-3 border-b border-white/5">
                <div className="bg-[#c5ff41] p-2 rounded-xl shadow-[0_0_15px_rgba(197,255,65,0.4)]">
                    <Droplet className="w-6 h-6 text-[#060912]" strokeWidth={3} />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase italic">MotaCréditos</span>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-3">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-4 w-full p-4 rounded-2xl transition-all duration-300 group ${activePath === item.path
                                ? "bg-[#c5ff41] text-[#060912] font-bold shadow-[0_0_20px_rgba(197,255,65,0.2)]"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activePath === item.path ? "text-[#060912]" : "text-slate-500 group-hover:text-[#c5ff41]"
                            }`} />
                        <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-6">
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Versión 2.0</p>
                    <p className="text-[10px] text-slate-400 font-medium">MotaCréditos © 2026</p>
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
            <div className="bg-[#151a2d]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 shadow-2xl flex justify-between items-center transition-all">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center py-3 px-5 rounded-[24px] transition-all duration-300 ${activePath === item.path
                                ? "bg-[#c5ff41] text-[#060912] scale-105 shadow-[0_0_20px_rgba(197,255,65,0.3)]"
                                : "text-slate-500"
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
        <div className="flex bg-[#060912] min-h-screen text-white selection:bg-[#c5ff41]/30 relative pb-24 md:pb-0">
            <Sidebar activePath={location.pathname} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="px-6 md:px-10 py-6 md:py-8 flex justify-between items-center z-10 shrink-0">
                    <div className="flex items-center space-x-3 md:block">
                        <div className="md:hidden bg-[#c5ff41] p-2 rounded-xl">
                            <Droplet className="w-5 h-5 text-[#060912]" strokeWidth={3} />
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-0.5 md:mb-1">MotaCréditos</p>
                            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">Panel de Gestión</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <button className="p-2.5 md:p-3 bg-slate-800/50 rounded-2xl border border-white/5 hover:bg-slate-700 transition-colors relative">
                            <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#c5ff41] rounded-full shadow-[0_0_8px_rgba(197,255,65,0.6)]"></div>
                            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-slate-300" />
                        </button>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl border-2 border-white/10 shadow-lg"></div>
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
