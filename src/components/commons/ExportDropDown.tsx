import { useState, useRef, useEffect, type FC } from "react";

const ExportIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ExportDropdown = ({ onExportCsv, onExportXlsx }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cierra el dropdown si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        // Añadir el listener cuando el componente se monta
        document.addEventListener('mousedown', handleClickOutside);
        // Limpiar el listener cuando el componente se desmonta
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);


    return (
        // Contenedor relativo para posicionar el menú
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                {/* Este es el botón principal que el usuario ve */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)} // Abre y cierra el menú
                    className="flex items-center gap-2 text-sm font-semibold text-[#2A6449] bg-green-100/50 hover:bg-green-100/80 rounded-lg py-2 px-4 transition-colors"
                    title="Opciones de exportación"
                >
                    <ExportIcon />
                    <span>Exportar</span>
                    {/* Pequeña flecha para indicar que es un dropdown */}
                    <svg
                        className={`-mr-1 ml-1 h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {/* El menú desplegable */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200/80 py-1 origin-top-right"
                >
                    <div className="py-1" role="none">
                        {/* Opción para exportar a XLSX */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onExportXlsx();
                                setIsOpen(false); // Cierra el menú después de hacer clic
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            role="menuitem"
                        >
                            Exportar a Excel (.xlsx)
                        </button>
                        {/* Opción para exportar a CSV */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onExportCsv();
                                setIsOpen(false); // Cierra el menú después de hacer clic
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            role="menuitem"
                        >
                            Exportar a CSV (.csv)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;