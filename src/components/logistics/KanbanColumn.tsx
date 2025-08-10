import { Loader2 } from "lucide-react";
import { useContext } from "react";
import { DndContext } from "../../providers/DndProvider";
import KanbanCard from "./KanbanCard";

const KanbanColumn = ({ column, columns }) => {
    const { tasks, dropTargetId, handleDragEnter, handleDragEnd, isLoading } = useContext(DndContext);
    const columnTasks = tasks[column.id] ? tasks[column.id].map(t => ({ ...t, columnId: column.id })) : [];
    const isDropTarget = dropTargetId === column.id;
    return (
        <div
            className={`relative flex-1 min-w-[300px] rounded-xl p-4 transition-colors duration-300 ${isDropTarget ? 'bg-primary-light' : 'bg-background'}`}
            onDragEnter={() => handleDragEnter(column.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDragEnd}
        >
            <h3 className="font-bold text-text-primary mb-4 px-2 flex items-center justify-between">
                {column.title}
                <span className="text-sm font-normal bg-gray-200 text-text-secondary rounded-full px-2.5 py-1">{columnTasks.length}</span>
            </h3>
            <div className="h-full space-y-4">
                {columnTasks.map(task => (<KanbanCard key={task.id} task={task} columns={columns} />))}
            </div>
            {isLoading && isDropTarget && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>
            )}
        </div>
    );
};

export default KanbanColumn;