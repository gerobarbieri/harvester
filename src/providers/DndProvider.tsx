import { createContext, useState } from "react";
import { useToast } from "./ToastProvider";

export const DndContext = createContext({});
const DndProvider = ({ children, initialTasks, columns }) => {
    const [tasks, setTasks] = useState(initialTasks);
    const [draggedItem, setDraggedItem] = useState(null);
    const [sourceColumnId, setSourceColumnId] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const showToast = useToast();

    const handleDragStart = (task, colId) => {
        setDraggedItem(task);
        setSourceColumnId(colId);
    };

    const handleDragEnter = (colId) => {
        setDropTargetId(colId);
    };

    const handleDragEnd = async () => {
        if (draggedItem && sourceColumnId && dropTargetId && sourceColumnId !== dropTargetId) {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            setTasks(prev => {
                const newTasks = { ...prev };
                newTasks[sourceColumnId] = newTasks[sourceColumnId].filter(t => t.id !== draggedItem.id);
                newTasks[dropTargetId] = [...newTasks[dropTargetId], { ...draggedItem, columnId: dropTargetId }];
                return newTasks;
            });
            // showToast(`Tarea ${draggedItem.orden} movida a ${columns.find(col => col.id === dropTargetId)?.title}`, 'success');
            setIsLoading(false);
        }
        setDraggedItem(null);
        setSourceColumnId(null);
        setDropTargetId(null);
    };

    const moveTaskToColumn = async (task, newColumnId) => {
        if (task.columnId === newColumnId) return;
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setTasks(prev => {
            const newTasks = { ...prev };
            newTasks[task.columnId] = newTasks[task.columnId].filter(t => t.id !== task.id);
            newTasks[newColumnId] = [...newTasks[newColumnId], { ...task, columnId: newColumnId }];
            return newTasks;
        });
        // showToast(`Tarea ${task.orden} movida a ${columns.find(col => col.id === newColumnId)?.title}`, 'success');
        setIsLoading(false);
    };

    const value = { tasks, draggedItem, dropTargetId, handleDragStart, handleDragEnter, handleDragEnd, moveTaskToColumn, isLoading };
    return <DndContext.Provider value={value}>{children}</DndContext.Provider>;
};

export default DndProvider;