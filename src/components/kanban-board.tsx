import { useCallback, useState, useEffect } from "react";
import {
  DndContext,
  useDroppable,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  UniqueIdentifier,
  DragOverlay,
  PointerActivationConstraint,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useTaskStore } from "../store/task-store";
import { Task, TaskStatus } from "../types/task";
import { Card, CardBody, CardFooter, CardHeader, cn, Divider } from "@heroui/react";
import { statusConfig } from "./status-chip";
import { TaskCard } from "./task-card";
import { Icon } from "@iconify/react";
import { AddTaskModal } from "./add-task-modal";
import { motion, AnimatePresence } from "framer-motion";

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
  const { setNodeRef, over, active } = useDroppable({ id, data: { type: "column" } });
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


function Trash({ isVisible }: { isVisible: boolean }) {
  const { setNodeRef, over } = useDroppable({ id: "trash", data: { type: "trash" } });
  const overThis = over?.id === "trash";

  const variants = {
    initial: { opacity: 0, scale: 0, filter: 'blur(9px)', x: '-50%' },
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: overThis ? 1.5 : 0, filter: 'blur(9px)' },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={setNodeRef}
          className={cn(
            "absolute z-50 transition-all",
            "bg-default-50 text-danger-800 transition-all",
            "flex items-center justify-center gap-3",
            "left-1/2 top-10 h-32 w-72 max-w-full",
            "rounded-lg border-2 border-dashed border-default-200",
            overThis && "bg-danger-50 text-danger-700 border-danger-200 w-96",
          )}
          variants={variants}
          initial="initial"
          animate={"enter"}
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <div className={cn(
            "flex items-center justify-center gap-3 transition-all",
            overThis ? 'animate-bounce scale-125' : 'scale-80'
          )}>
            <Icon icon='lucide:trash-2' className='text-2xl' />
            <div className='text-xl'>
              Drop Here To Delete
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



export function KanbanBoard({ filteredTasks }: KanbanBoardProps) {
  const changeStatus = useTaskStore((state) => state.changeStatus);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [trashId, setTrashId] = useState<UniqueIdentifier | null>(null);

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

    const getUpdatedColumn = (
      columnId: TaskStatus,
      prevColumnTasks: { [key in TaskStatus]: Task[] }
    ): Task[] | null => {
      const sortTasksById = (tasks: Task[]) =>
        tasks.slice().sort((a, b) => a.id.localeCompare(b.id));

      const prevIds = sortTasksById(prevColumnTasks[columnId]).map((task) => task.id);
      const newIds = sortTasksById(newColumnTasks[columnId]).map((task) => task.id);

      const isIdDifferent = JSON.stringify(newIds) !== JSON.stringify(prevIds);

      if (isIdDifferent) {
        if (newIds.length === prevIds.length - 1) {
          // Check if single item is deleted
          const deletedId = prevIds.find((id) => !newIds.includes(id));
          console.log("deleted");
          if (deletedId) {
            return prevColumnTasks[columnId].filter((task) => task.id !== deletedId);
          }
        }
        return newColumnTasks[columnId];
      }

      const isContentDifferent = newColumnTasks[columnId].some(
        (task, index) => JSON.stringify(task) !== JSON.stringify(prevColumnTasks[columnId][index])
      );

      if (isContentDifferent) {
        return prevColumnTasks[columnId].map(
          (task) => newColumnTasks[columnId].find((t) => t.id === task.id) || task
        );
      }

      return null;
    };

    setColumnTasks((prevColumnTasks) => {
      let hasUpdates = false;
      const updatedColumnTasks: { [key in TaskStatus]: Task[] } = { ...prevColumnTasks };

      for (const columnId of columnIds) {
        const updatedColumn = getUpdatedColumn(columnId, prevColumnTasks);
        if (updatedColumn) {
          updatedColumnTasks[columnId] = updatedColumn;
          hasUpdates = true;
        }
      }

      return hasUpdates ? updatedColumnTasks : prevColumnTasks;
    });
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

    if (overId === "trash" && activeColumnId) {
      setTrashId(active.id);
      // Moving task to trash
      const activeTask = columnTasks[activeColumnId].find((task) => task.id === active.id);
      if (!activeTask) return;
      setColumnTasks((prevBoardState) => {
        const newBoardState = { ...prevBoardState };
        const activeColumnTasks = newBoardState[activeColumnId];
        // Remove from active column
        newBoardState[activeColumnId] = activeColumnTasks.filter((task) => task.id !== active.id);
        return newBoardState;
      });
      return;
    }

    const overColumnId = findColumnForTask(overId);
    if (!overColumnId) return;

    if (trashId !== null) {
      if (typeof trashId !== "string") return;
      setTrashId(null);
      changeStatus(trashId, overColumnId);
      setColumnTasks((prevBoardState) => {
        const newBoardState = { ...prevBoardState };

        // const activeColumnTasks = newBoardState[activeColumnId];
        const overColumnTasks = newBoardState[overColumnId];

        const activeTask = filteredTasks.find((task) => task.id === active.id);
        if (!activeTask) return prevBoardState;

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
      return;
    }

    if (!activeColumnId) return;
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

    const overId = over?.id;
    if (overId === "trash") {
      console.log("trashing");
      deleteTask(active.id);
      return;
    }

    const activeColumnId = findColumnForTask(active.id);
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
    return <TaskCard task={activeTask} overlay overTrash={activeId === trashId} />;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      {/* {activeId !== null && <Trash />} */}
      <Trash isVisible={activeId !== null} />
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
