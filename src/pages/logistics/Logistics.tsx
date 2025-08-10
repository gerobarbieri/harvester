
import DndProvider from "../../providers/DndProvider";
import Filters from "../../components/logistics/Filters";
import KanbanColumn from "../../components/logistics/KanbanColumn";

const Logistics = () => {
    const columns = [
        { id: 'solicitado', title: 'Solicitado' },
        { id: 'en_camino_campo', title: 'En Camino a Campo' },
        { id: 'cargando', title: 'Cargando' },
        { id: 'en_camino_destino', title: 'En Camino a Destino' },
    ];



    return (
        <DndProvider initialTasks={[]} columns={columns}>
            <div className="space-y-6">
                <Filters />

                <div className="flex gap-6 overflow-x-auto pb-4 -m-6 p-6">
                    {columns.map(column => (
                        <KanbanColumn key={column.id} column={column} columns={columns} />
                    ))}
                </div>
            </div>
        </DndProvider>
    );
};

export default Logistics;
