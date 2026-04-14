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

function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/clientes', label: 'Clientes', icon: Users },
        { path: '/ventas', label: 'Ventas', icon: ShoppingBag },
        { path: '/pagos', label: 'Abonos', icon: CreditCard },
    ];

    return (
        <div className="w-64 bg-[#0A0E21] text-white flex flex-col h-screen border-r border-white/5 shadow-2xl z-20">
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
                        className={`flex items-center space-x-4 w-full p-4 rounded-2xl transition-all duration-300 group ${isActive(item.path)
                            ? "bg-[#c5ff41] text-[#060912] font-bold shadow-[0_0_20px_rgba(197,255,65,0.2)]"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive(item.path) ? "text-[#060912]" : "text-slate-500 group-hover:text-[#c5ff41]"
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

function App() {
    return (
        <Router>
            <div className="flex bg-[#060912] min-h-screen text-white selection:bg-[#c5ff41]/30">
                <Sidebar />
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    <header className="px-10 py-8 flex justify-between items-center z-10">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Bienvenido de nuevo</p>
                            <h1 className="text-3xl font-black text-white tracking-tight">Panel de Gestión</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-3 bg-slate-800/50 rounded-2xl border border-white/5 hover:bg-slate-700 transition-colors relative">
                                <div className="absolute top-3 right-3 w-2 h-2 bg-[#c5ff41] rounded-full shadow-[0_0_8px_rgba(197,255,65,0.6)]"></div>
                                <ShoppingBag className="w-5 h-5 text-slate-300" />
                            </button>
                            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl border-2 border-white/10 shadow-lg"></div>
                        </div>
                    </header>
                    <div className="flex-1 overflow-auto px-10 pb-10">
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
            </div>
        </Router>
    );
}

export default App;
