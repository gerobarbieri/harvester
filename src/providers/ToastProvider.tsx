import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { createContext, useContext, useRef, useState } from "react";

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);

    const showToast = (message, type = 'info', duration = 3000) => {
        const id = toastId.current++;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    };

    const ToastComponent = ({ message, type }) => {
        const styles = {
            success: 'bg-primary text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-orange-500 text-white',
            error: 'bg-red-500 text-white',
        };
        const icons = {
            success: <CheckCircle size={20} />,
            info: <Info size={20} />,
            warning: <AlertTriangle size={20} />,
            error: <XCircle size={20} />,
        };
        return (
            <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg w-full max-w-sm transition-all duration-300 animate-fade-in-right ${styles[type]}`}>
                {icons[type]}
                <span>{message}</span>
            </div>
        );
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="fixed top-5 right-5 z-[100] space-y-3">
                {toasts.map(toast => (
                    <ToastComponent key={toast.id} message={toast.message} type={toast.type} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);