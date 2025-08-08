import type { FC } from "react";

export const Button: FC<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'error';
    type?: 'button' | 'submit';
    disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', type = 'button', disabled = false }) => {

    const baseStyles = `
        w-full px-5 py-3 text-base font-semibold rounded-lg shadow-sm 
        transition-all duration-200 ease-in-out 
        active:scale-95 focus-visible:outline focus-visible:outline-2 
        focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        hover: cursor-pointer
    `;

    const variants = {
        primary: `
            bg-green-900 text-white hover:bg-green-800 
            focus-visible:outline-green-700
        `,
        secondary: `
            bg-transparent text-slate-700 border-2 border-slate-300
            hover:bg-slate-100 hover:border-slate-400
            focus-visible:outline-slate-500
        `,
        error: `
            bg-red-600 text-white hover:bg-red-500 
            focus-visible:outline-red-400
        `
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]}`}
        >
            {children}
        </button>
    );
}

export default Button;