import React, { useState } from 'react';
import { ChartColumnIncreasing, ClipboardList, Archive, Tractor, Truck } from "lucide-react";
import { DesktopSidebar } from './desktop/Sidebar';
import { MobileHeader } from './mobile/Header';
import { MobileBottomNav } from './mobile/BottomBar';
import { DesktopHeader } from './desktop/Header'
import { Outlet } from 'react-router';

const navItems = [
    { name: 'Monitor Diario', icon: ClipboardList, path: '/' },
    {
        name: 'Reportes',
        icon: ChartColumnIncreasing,
        path: '/reports',
        roles: ['admin', 'owner'] // Solo visible para administradores
    },
    { name: 'Cosecha', icon: Tractor, path: '/harvest-sessions' },
    { name: 'Logística', icon: Truck, path: '/logistics' },
    { name: 'Silos', icon: Archive, path: '/silo-bags' },
];

const Layout: React.FC = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background text-text-primary">

            <DesktopSidebar
                navItems={navItems}
            />

            <div className="flex-1 flex flex-col lg:ml-20">
                <header>
                    <MobileHeader />
                    <DesktopHeader
                        isUserMenuOpen={isUserMenuOpen}
                        setIsUserMenuOpen={setIsUserMenuOpen}
                    />
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
                    <Outlet />
                </main>

                <MobileBottomNav
                    navItems={navItems}
                />
            </div>
        </div>
    );
};

export default Layout;