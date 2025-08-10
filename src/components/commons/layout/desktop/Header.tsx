import React from 'react';
import { User, Briefcase, LogOut } from 'lucide-react';

// -- Cabecera para Escritorio --
interface DesktopHeaderProps {
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (isOpen: boolean) => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ isUserMenuOpen, setIsUserMenuOpen }) => {
    return (
        <div className="hidden lg:flex items-center justify-between p-6 bg-primary rounded-bl-1xl">
            <h1 className="text-white text-3xl font-semibold">Hallmay</h1>
            <div className="flex items-center space-x-4">
                <a
                    href="/backoffice"
                    target='_blank'
                    className="flex items-center space-x-2 bg-white text-primary-dark px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                    <Briefcase size={16} />
                    <span>IR AL BACKOFFICE</span>
                </a>
                <div className="w-px h-6 bg-primary-medium"></div>
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-10 h-10 bg-primary-medium rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                    >
                        <User size={20} />
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute right-0 top-12 bg-surface border border-gray-200 rounded-lg shadow-lg py-1 min-w-40 z-50 animate-fade-in-fast">
                            <button className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut size={16} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}