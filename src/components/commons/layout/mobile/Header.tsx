import { User } from "lucide-react";

// -- Cabecera para Móvil --
export const MobileHeader: React.FC = () => {
    return (
        <div className="lg:hidden sticky top-0 bg-primary p-4 rounded-b-2xl z-40 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-primary-darker w-12 h-12 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">H</span>
                    </div>
                    <div>
                        <div className="text-white text-xl font-bold">Hallmay</div>
                    </div>
                </div>
                <button className="w-10 h-10 text-white hover:bg-primary-medium rounded-full flex items-center justify-center transition-colors">
                    <User size={20} />
                </button>
            </div>
        </div>
    );
};