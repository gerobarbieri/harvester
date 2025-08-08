import { useState, useRef, useEffect, type FC } from 'react';

// Definimos los tipos que el componente espera
interface Option {
    id: string;
    name: string;
}

interface TagSelectProps {
    label: string;
    options: Option[];
    selectedItems: Option[];
    onSelectionChange: (newSelection: Option[]) => void;
    placeholder?: string;
}

const TagSelect: FC<TagSelectProps> = ({
    label,
    options,
    selectedItems,
    onSelectionChange,
    placeholder = "Seleccione opciones...",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Hook para cerrar el dropdown si se hace clic afuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectOption = (option: Option) => {
        // Agregamos la nueva opción a la selección existente
        onSelectionChange([...selectedItems, option]);
        // Mantenemos el dropdown abierto para más selecciones
    };

    const handleRemoveOption = (itemToRemove: Option) => {
        onSelectionChange(selectedItems.filter(item => item.id !== itemToRemove.id));
    };

    // Filtramos las opciones para no mostrar en el dropdown las que ya han sido seleccionadas
    const availableOptions = options.filter(
        opt => !selectedItems.some(sel => sel.id === opt.id)
    );

    return (
        <div ref={containerRef} className="relative w-full">
            <label className="font-semibold text-black-700">{label}</label>

            {/* Contenedor principal que simula un input */}
            <div
                className="w-full mt-1 p-2 pr-0.5 border border-black-300 rounded-lg bg-white flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Contenedor para las "píldoras" (tags) y el placeholder */}
                <div className="flex flex-wrap gap-2 items-center flex-grow">
                    {selectedItems.length === 0 ? (
                        <span className="text-black-400">{placeholder}</span>
                    ) : (
                        selectedItems.map(item => (
                            <span key={item.id} className="bg-emerald-100 text-emerald-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-2">
                                {item.name}
                                <button
                                    type="button"
                                    className="text-emerald-600 hover:text-emerald-800"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Evita que el clic en la 'x' cierre el dropdown
                                        handleRemoveOption(item);
                                    }}
                                >
                                    &times;
                                </button>
                            </span>
                        ))
                    )}
                </div>

                {/* Ícono de Flecha (SVG) */}
                <svg
                    className={`w-3 h-3 text-black-500 transition-transform transform ${isOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2} // Grosor de la línea
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </div>

            {/* El Dropdown que aparece y desaparece */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-black-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                        {availableOptions.length > 0 ? (
                            availableOptions.map(option => (
                                <li
                                    key={option.id}
                                    className="p-2 text-sm text-black-800 hover:bg-emerald-50 cursor-pointer"
                                    onClick={() => handleSelectOption(option)}
                                >
                                    {option.name}
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-sm text-black-500">No hay más opciones.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TagSelect;