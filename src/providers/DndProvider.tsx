// src/providers/DndProvider.tsx
import React, { createContext, useState, useContext, type ReactNode } from 'react';

interface Task {
    id: string;
    orden: string;
    fecha: string;
    campo: string;
    cultivo: string;
    chofer: string;
    empresa: string;
    columnId: string;
}

interface Column {
    id: string;
    title: string;
}

interface DndContextType {
    tasks: Record<string, Task[]>;
    setTasks: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
    draggedItem: Task | null;
    setDraggedItem: React.Dispatch<React.SetStateAction<Task | null>>;
    dropTargetId: string | null;
    setDropTargetId: React.Dispatch<React.SetStateAction<string | null>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    handleDragStart: (task: Task, sourceColumnId: string) => void;
    handleDragEnter: (targetColumnId: string) => void;
    handleDragEnd: () => void;
}

const DndContext = createContext<DndContextType | undefined>(undefined);

interface DndProviderProps {
    children: ReactNode;
    initialTasks: Record<string, Task[]>;
    columns: Column[];
}

const DndProvider: React.FC<DndProviderProps> = ({ children, initialTasks, columns }) => {
    const [tasks, setTasks] = useState<Record<string, Task[]>>(initialTasks);
    const [draggedItem, setDraggedItem] = useState<Task | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDragStart = (task: Task, sourceColumnId: string) => {
        setDraggedItem({ ...task, columnId: sourceColumnId });
    };

    const handleDragEnter = (targetColumnId: string) => {
        setDropTargetId(targetColumnId);
    };

    const handleDragEnd = async () => {
        if (!draggedItem || !dropTargetId || draggedItem.columnId === dropTargetId) {
            setDraggedItem(null);
            setDropTargetId(null);
            return;
        }

        setIsLoading(true);

        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Actualizar las tareas
            setTasks(prevTasks => {
                const newTasks = { ...prevTasks };

                // Remover de la columna origen
                newTasks[draggedItem.columnId] = newTasks[draggedItem.columnId]?.filter(
                    task => task.id !== draggedItem.id
                ) || [];

                // Agregar a la columna destino
                if (!newTasks[dropTargetId]) {
                    newTasks[dropTargetId] = [];
                }

                newTasks[dropTargetId] = [
                    ...newTasks[dropTargetId],
                    { ...draggedItem, columnId: dropTargetId }
                ];

                return newTasks;
            });

            // TODO: Aquí iría la llamada a la API para actualizar el estado en la base de datos
            console.log(`Moviendo tarea ${draggedItem.id} de ${draggedItem.columnId} a ${dropTargetId}`);

        } catch (error) {
            console.error('Error al mover tarea:', error);
            // TODO: Mostrar mensaje de error al usuario
        } finally {
            setIsLoading(false);
            setDraggedItem(null);
            setDropTargetId(null);
        }
    };

    const value: DndContextType = {
        tasks,
        setTasks,
        draggedItem,
        setDraggedItem,
        dropTargetId,
        setDropTargetId,
        isLoading,
        setIsLoading,
        handleDragStart,
        handleDragEnter,
        handleDragEnd
    };

    return (
        <DndContext.Provider value={value}>
            {children}
        </DndContext.Provider>
    );
};

export const useDndContext = (): DndContextType => {
    const context = useContext(DndContext);
    if (!context) {
        throw new Error('useDndContext must be used within a DndProvider');
    }
    return context;
};

export { DndContext };
export default DndProvider;