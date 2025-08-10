import { GripVertical } from "lucide-react";
import { useContext, useState } from "react";
import { DndContext } from "../../providers/DndProvider";

const KanbanCard = ({ task, columns }) => {
    const { draggedItem, handleDragStart, handleDragEnd } = useContext(DndContext);
    const isDragging = draggedItem?.id === task.id;
    return (
        <>
            <div
                draggable
                onDragStart={(e) => { handleDragStart(task, task.columnId); e.dataTransfer.setData('text/plain', ''); }}
                onDragEnd={handleDragEnd}
                className={`p-4 bg-surface rounded-lg border border-gray-200/80 shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-105 shadow-xl' : 'opacity-100'}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-text-primary">{task.orden}</p>
                        <span className="text-xs text-text-secondary">{task.fecha}</span>
                    </div>
                    <div className="hidden md:block p-2 text-gray-400"><GripVertical size={20} /></div>
                </div>
                <p className="text-sm text-text-secondary mt-2"><span className="font-medium">Campo:</span> {task.campo}</p>
                <p className="text-sm text-text-secondary"><span className="font-medium">Cultivo:</span> {task.cultivo}</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-text-secondary"><span className="font-medium">Chofer:</span> {task.chofer}</p>
                    <p className="text-sm text-text-secondary"><span className="font-medium">Empresa:</span> {task.empresa}</p>
                </div>
            </div>
        </>
    );
};

export default KanbanCard;