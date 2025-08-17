// src/providers/ToastProvider.tsx
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import React, { createContext, useContext, useRef, useState, type ReactNode, useCallback, useEffect } from "react";

// --- Tipos y Contexto ---
interface Toast {
    id: number;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
}
type ShowToastFunction = (message: string, type?: Toast['type'], duration?: number) => void;
const ToastContext = createContext<ShowToastFunction>(() => { });

// --- Componente Toast Individual (Ahora es más inteligente) ---
const ToastComponent: React.FC<{ toast: Toast & { duration: number }, onRemove: (id: number) => void }> = ({ toast, onRemove }) => {

    useEffect(() => {
        // Cada toast gestiona su propio temporizador para desaparecer.
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration);

        // Limpieza: si el toast se elimina antes (ej. por un cambio de página), se limpia el temporizador.
        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-orange-50 border-orange-200 text-orange-800',
        error: 'bg-red-50 border-red-200 text-red-800',
    };
    const icons = {
        success: <CheckCircle size={20} />,
        info: <Info size={20} />,
        warning: <AlertTriangle size={20} />,
        error: <XCircle size={20} />,
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg w-full max-w-sm border transition-all duration-300 animate-fade-in-right ${styles[toast.type]}`}>
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <span className="font-semibold">{toast.message}</span>
        </div>
    );
};

// --- Proveedor Principal ---
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Array<Toast & { duration: number }>>([]);
    const toastIdCounter = useRef(0); // Usamos useRef para el contador, ya que no necesita causar re-renders.

    const showToast = useCallback<ShowToastFunction>((message, type = 'info', duration = 3000) => {
        const id = toastIdCounter.current++;
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="fixed top-5 right-5 z-[101] space-y-3">
                {toasts.map(toast => (
                    <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ShowToastFunction => useContext(ToastContext);