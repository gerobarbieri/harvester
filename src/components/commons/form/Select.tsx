import { ChevronDown } from "lucide-react";

type SelectOption = {
    id?: string | number;
    value?: string | number;
    name?: string;
    label?: string;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    name: string;
    items: SelectOption[];
    error?: string;
    placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, name, items, error, className = '', ...props }) => (
    <div className={`w-full ${className}`}>
        {label && <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>}
        <div className="relative">
            <select
                id={name}
                name={name}
                className={`w-full p-3 pr-10 border ${error ? 'border-red-400' : 'border-gray-300'} bg-background rounded-xl shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-primary-dark'} focus:border-transparent appearance-none`}
                {...props}
            >
                {props.placeholder && <option value="">{props.placeholder}</option>}
                {items.map((item) => (
                    <option key={item.id || item.value} value={item.id || item.value}>
                        {item.name || item.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
);

export default Select