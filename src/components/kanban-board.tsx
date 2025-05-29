import { useCallback, useState, useEffect } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  UniqueIdentifier,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { useTaskStore } from "../store/task-store";
import { Task, TaskStatus } from "../types/task";
import { cn } from "@heroui/react";
import { statusConfig } from "./status-chip";
import { TaskCard } from "./task-card";

interface KanbanBoardProps {
  filteredTasks: Task[];
}

interface KanbanColumnProps {
  id: TaskStatus;
  tasks: Task[];
  children: React.ReactNode;
}

function KanbanColumn({ id, tasks, children }: KanbanColumnProps) {
  const { setNodeRef, over, active } = useSortable({
    id,
    data: { type: "column", tasks: tasks.map((task) => task.id) },
  });
  const title = statusConfig[id].title;

  const isOverThisColumn = over
    ? (id === over.id && active?.data.current?.type !== "column") ||
      tasks.map((task) => task.id).includes(over.id as string)
    : false;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "mx-2 flex w-80 flex-shrink-0 flex-col rounded-lg p-4 shadow-md",
        isOverThisColumn ? "bg-default-200" : "bg-default-100"
      )}
    >
      <h2 className="mb-4 text-xl font-semibold text-default-800">{title}</h2>
      <div className="min-h-[50px] flex-grow">{children}</div>
    </div>
  );
}

// --- Main Kanban Board Component ---
export function KanbanBoard({ filteredTasks }: KanbanBoardProps) {
  const changeStatus = useTaskStore((state) => state.changeStatus);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const [columnTasks, setColumnTasks] = useState<{ [key in TaskStatus]: Task[] }>({
    todo: [],
    "in-progress": [],
    done: [],
  });

  useEffect(() => {
    const newColumnTasks = {
      todo: filteredTasks.filter((task) => task.status === "todo"),
      "in-progress": filteredTasks.filter((task) => task.status === "in-progress"),
      done: filteredTasks.filter((task) => task.status === "done"),
    };

    console.count("running effect");
    const columnIds: TaskStatus[] = ["todo", "in-progress", "done"];
    const sortTasksById = (tasks: Task[]) => tasks.slice().sort((a, b) => a.id.localeCompare(b.id));

    let isIdDifferent = false;
    for (const columnId of columnIds) {
      if (
        JSON.stringify(sortTasksById(newColumnTasks[columnId]).map((task) => task.id)) !==
        JSON.stringify(sortTasksById(columnTasks[columnId]).map((task) => task.id))
      ) {
        isIdDifferent = true;
        break;
      }
    }

    if (isIdDifferent) {
      // If IDs are different, overwrite the state
      setColumnTasks(newColumnTasks);
    } else {
      // If IDs are the same, check for content differences
      let isContentDifferent = false;
      for (const columnId of columnIds) {
        if (
          newColumnTasks[columnId].some(
            (task, index) => JSON.stringify(task) !== JSON.stringify(columnTasks[columnId][index])
          )
        ) {
          isContentDifferent = true;
          break;
        }
      }

      if (isContentDifferent) {
        // If content is different, update the content while preserving the existing order
        setColumnTasks((prevColumnTasks) => {
          const updatedColumnTasks = {
            todo: prevColumnTasks.todo.map(
              (task) => newColumnTasks.todo.find((t) => t.id === task.id) || task
            ),
            "in-progress": prevColumnTasks["in-progress"].map(
              (task) => newColumnTasks["in-progress"].find((t) => t.id === task.id) || task
            ),
            done: prevColumnTasks.done.map(
              (task) => newColumnTasks.done.find((t) => t.id === task.id) || task
            ),
          };
          return updatedColumnTasks;
        });
      }
    }
  }, [filteredTasks]);

  const columns = Object.entries(statusConfig).map(([key]) => key as TaskStatus);

  // Find which column a given task ID belongs to
  const findColumnForTask = useCallback(
    (id: UniqueIdentifier): TaskStatus | undefined => {
      if (columns.some((col) => col === id)) return id as TaskStatus;
      for (const columnId in columnTasks) {
        if (columnTasks[columnId as TaskStatus].some((task) => task.id === id)) {
          return columnId as TaskStatus;
        }
      }
      return undefined;
    },
    [columnTasks]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = ({ active }: { active: any }) => setActiveId(active.id);

  const handleDragOver = ({ active, over }: { active: any; over: any }) => {
    const overId = over?.id;
    if (!overId || active.id === overId) return;

    const activeColumnId = findColumnForTask(active.id);
    const overColumnId = findColumnForTask(overId);

    if (!activeColumnId || !overColumnId) return;
    if (activeColumnId !== overColumnId) {
      // Moving task to a different column
      const activeTask = columnTasks[activeColumnId].find((task) => task.id === active.id);
      if (!activeTask) return;

      changeStatus(activeTask.id, overColumnId);
      setColumnTasks((prevBoardState) => {
        const newBoardState = { ...prevBoardState };

        const activeColumnTasks = newBoardState[activeColumnId];
        const overColumnTasks = newBoardState[overColumnId];

        const activeTask = activeColumnTasks.find((task) => task.id === active.id);
        if (!activeTask) return prevBoardState; // Should not happen

        // Remove from active column
        newBoardState[activeColumnId] = activeColumnTasks.filter((task) => task.id !== active.id);

        // Determine new index in the over column
        let newIndex: number;
        if (columns.some((col) => col === overId)) {
          // If dragging over the column header/empty space
          newIndex = overColumnTasks.length; // Add to end
        } else {
          // If dragging over another task
          const overIndex = overColumnTasks.findIndex((task) => task.id === overId);
          newIndex = overIndex !== -1 ? overIndex : overColumnTasks.length;
        }
        // Insert into over column
        newBoardState[overColumnId] = [
          ...overColumnTasks.slice(0, newIndex),
          activeTask,
          ...overColumnTasks.slice(newIndex),
        ];
        return newBoardState;
      });
    }
  };

  const handleDragEnd = ({ active, over }: { active: any; over: any }) => {
    setActiveId(null);

    const activeColumnId = findColumnForTask(active.id);
    const overId = over?.id;

    if (!overId || !activeColumnId) return;

    const overColumnId = findColumnForTask(overId);

    if (!overColumnId) return;

    if (activeColumnId === overColumnId) {
      // Reordering within the same column
      if (active.id !== overId) {
        const activeColumnTasks = columnTasks[activeColumnId];
        const oldIndex = activeColumnTasks.findIndex((task) => task.id === active.id);
        const newIndex = activeColumnTasks.findIndex((task) => task.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          setColumnTasks((prevColumnTasks) => {
            const updatedColumnTasks = { ...prevColumnTasks };
            updatedColumnTasks[activeColumnId] = arrayMove(activeColumnTasks, oldIndex, newIndex);
            return updatedColumnTasks;
          });
        }
      }
    }
  };

  const handleDragCancel = () => setActiveId(null);

  const renderDragOverlayContent = () => {
    if (!activeId) return null;
    const activeTask = filteredTasks.find((task) => task.id === activeId);
    if (!activeTask) return null;
    return (
      <div className="rotate-2 transition-transform duration-100 ease-in-out">
        <TaskCard task={activeTask} />
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex min-h-[calc(100vh-32px)] p-4">
        {columns.map((column) => (
          <KanbanColumn key={column} id={column} tasks={columnTasks[column]}>
            <SortableContext items={columnTasks[column].map((task) => task.id)}>
              {columnTasks[column].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay adjustScale={false}>{renderDragOverlayContent()}</DragOverlay>,
    </DndContext>
  );
}
