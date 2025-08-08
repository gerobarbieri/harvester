import type { FC } from "react";
import { NavLink } from "react-router";

const BottomNavBar: FC = () => {
    const navItems = [
        { to: '/', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
        { to: '/campaigns', label: 'Campañas', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-t border-gray-200/80">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-around items-center h-full">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end // `end` prop es importante para que la ruta raíz no esté siempre activa
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-1 transition-colors w-24 ${isActive ? 'text-[#2A6449]' : 'text-gray-500 hover:text-gray-800'}`
                            }
                        >
                            {item.icon}
                            <span className="text-xs font-semibold">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default BottomNavBar;