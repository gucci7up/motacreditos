import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Users, ShoppingBag, CreditCard, Droplet } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Pagos from './pages/Pagos';

function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? "bg-indigo-700 font-bold" : "hover:bg-indigo-600";

    return (
        <div className="w-64 bg-indigo-800 text-white flex flex-col h-screen">
            <div className="p-6 flex items-center space-x-3 text-2xl font-bold border-b border-indigo-700">
                <Droplet className="w-8 h-8" />
                <span>MotaCréditos</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <Link to="/" className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${isActive('/')}`}>
                    <Home className="w-5 h-5" /> <span>Dashboard</span>
                </Link>
                <Link to="/clientes" className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${isActive('/clientes')}`}>
                    <Users className="w-5 h-5" /> <span>Clientes</span>
                </Link>
                <Link to="/ventas" className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${isActive('/ventas')}`}>
                    <ShoppingBag className="w-5 h-5" /> <span>Ventas</span>
                </Link>
                <Link to="/pagos" className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${isActive('/pagos')}`}>
                    <CreditCard className="w-5 h-5" /> <span>Abonos</span>
                </Link>
            </nav>
            <div className="p-4 text-xs text-indigo-300 text-center border-t border-indigo-700">
                MotaCréditos © 2026<br />
                Perfumes a Crédito
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    <header className="bg-white shadow px-8 py-5 flex justify-between items-center z-10">
                        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Panel de Control</h1>
                    </header>
                    <div className="flex-1 overflow-auto p-8">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/clientes" element={<Clientes />} />
                            <Route path="/ventas" element={<Ventas />} />
                            <Route path="/pagos" element={<Pagos />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}

export default App;
