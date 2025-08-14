// src/components/commons/form/Select.tsx
import { ChevronDown, Check } from "lucide-react";
import { type FC, useState, useRef, useEffect } from "react";

type SelectOption = {
    id?: string | number;
    value?: string | number;
    name?: string;
    label?: string;
};

// La interfaz ahora define 'value' y 'onChange' explícitamente para integrarse con el Controller de react-hook-form
interface SelectProps {
    label?: string;
    name: string;
    items: SelectOption[];
    error?: string;
    placeholder?: string;
    value?: string | number;
    onChange: (value: string | number) => void;
    disabled?: boolean;
    className?: string;
}

export const Select: FC<SelectProps> = ({ label, name, items, error, className = '', placeholder, value, onChange, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedItem = items.find(item => (item.id || item.value) === value);

    // Cierra el dropdown si se hace clic afuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (itemValue: string | number) => {
        onChange(itemValue);
        setIsOpen(false);
    };

    return (
        <div className={`w-full ${className}`} ref={dropdownRef}>
            {label && <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    id={name}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full p-3 pr-10 text-left border ${error ? 'border-red-400' : 'border-gray-300'} ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'} rounded-xl shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    disabled={disabled}
                >
                    <span className={`block truncate ${selectedItem ? 'text-gray-900' : 'text-gray-400'}`}>
                        {selectedItem ? (selectedItem.name || selectedItem.label) : placeholder || 'Seleccionar...'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </span>
                </button>

                {isOpen && !disabled && (
                    <div
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-auto focus:outline-none animate-fade-in-fast"
                        role="listbox"
                    >
                        {items.map((item) => {
                            const itemValue = item.id || item.value;
                            const isSelected = itemValue === value;
                            return (
                                <div
                                    key={itemValue}
                                    onClick={() => handleSelect(itemValue)}
                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                                        {item.name || item.label}
                                    </span>
                                    {isSelected ? (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                            <Check className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
};

export default Select;
