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
  PointerActivationConstraint,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { useTaskStore } from "../store/task-store";
import { Task, TaskStatus } from "../types/task";
import { Card, CardBody, CardFooter, CardHeader, cn, Divider } from "@heroui/react";
import { statusConfig } from "./status-chip";
import { TaskCard } from "./task-card";
import { Icon } from "@iconify/react";
import { AddTaskModal } from "./add-task-modal";

interface KanbanBoardProps {
  filteredTasks: Task[];
}

interface KanbanColumnProps {
  id: TaskStatus;
  tasks: Task[];
  children: React.ReactNode;
}

function KanbanColumn({ id, tasks, children }: KanbanColumnProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { setNodeRef, over, active } = useSortable({ id, data: { type: "column", tasks: tasks } });
  const config = statusConfig[id];

  const isOverThisColumn = over
    ? (id === over.id && active?.data.current?.type !== "column") ||
      tasks.map((task) => task.id).includes(over.id as string)
    : false;

  return (
    <>
      <Card
        ref={setNodeRef}
        className={cn(
          "border-2 border-transparent transition-all",
          isOverThisColumn && "border-primary-200"
        )}
      >
        <CardHeader className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon icon={config.icon} className={cn(`text-${config.color}`)} />
            <span className="font-medium">{config.title}</span>
            <span className="text-sm text-default-400">{tasks.length}</span>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="block max-h-[450px] min-h-[210px] flex-grow space-y-4 overflow-y-auto">
          {children}
        </CardBody>
        <Divider />
        <CardFooter
          className="flex cursor-pointer items-center justify-center text-lg text-default-300"
          onClick={() => setIsAddTaskOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Icon icon="lucide:plus" />
            <div>Add task</div>
          </div>
        </CardFooter>
      </Card>
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        initialState={{ status: id }}
      />
    </>
  );
}

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

  const activationConstraint: PointerActivationConstraint = {
    distance: 10,
    delay: 400,
  };
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: activationConstraint }),
    useSensor(TouchSensor, { activationConstraint: activationConstraint }),
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
    return <TaskCard task={activeTask} overlay />;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn key={column} id={column} tasks={columnTasks[column]}>
            <SortableContext items={columnTasks[column]}>
              {columnTasks[column].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {columnTasks[column].length === 0 && (
                <div className="m-auto flex size-full items-center justify-center rounded-md border-2 border-dashed border-divider text-center text-xl">
                  Drag it here
                </div>
              )}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay adjustScale={false}>{renderDragOverlayContent()}</DragOverlay>
    </DndContext>
  );
}
