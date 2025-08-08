import Button from "../../commons/Button";

const RegisterDeleteModal = ({ registerId, onConfirm, onCancel }) => {
    if (!registerId) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md text-center p-6 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Confirmar Eliminación</h2>
                <p className="text-gray-600">
                    ¿Estás seguro de que deseas eliminar este registro? <br />
                    Esta acción no se puede deshacer.
                </p>
                <div className="pt-4 flex justify-end gap-4">
                    <Button type="button" onClick={onCancel} variant="secondary">Cancelar</Button>
                    <Button
                        onClick={() => onConfirm(registerId)}
                        variant="error"
                    >
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RegisterDeleteModal;