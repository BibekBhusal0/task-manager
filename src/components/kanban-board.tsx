import React, { useCallback, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  UniqueIdentifier,
  getFirstCollision,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../store/task-store';
import { Task, TaskStatus } from '../types/task';

interface KanbanBoardProps {
  filteredTasks: Task[];
}

// --- Column Component (Droppable Container) ---
interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  children: React.ReactNode;
}

function KanbanColumn({ id, title, tasks, children }: KanbanColumnProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    over,
    active,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: 'column',
      tasks: tasks.map((task) => task.id), // Only pass IDs for collision detection
    },
  });

  // Determine if a draggable item is currently over this column
  // This helps visually indicate where an item will be dropped
  const isOverThisColumn = over
    ? (id === over.id && active?.data.current?.type !== 'column') ||
    tasks.map((task) => task.id).includes(over.id as string)
    : false;

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
          flex flex-col flex-shrink-0 w-80 p-4 mx-2 rounded-lg shadow-md
          ${isOverThisColumn ? 'bg-default-200' : 'bg-default-100'}
        `}
      {...attributes}
      {...listeners} // Listeners for dragging the column itself (if column reordering was enabled)
    >
      <h2 className="text-xl font-semibold mb-4 text-default-800">{title}</h2>
      <div className="flex-grow min-h-[50px]">{children}</div>{' '}
      {/* Min-height for empty columns */}
    </div>
  );
}

// --- Task Component (Sortable Item) ---
interface KanbanTaskProps {
  id: string;
  title: string; // Changed from content to title
}

function KanbanTask({ id, title }: KanbanTaskProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.7 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
          bg-default-50 p-4 mb-3 rounded-md shadow-sm border border-default-400
          hover:shadow-md transition-shadow duration-200 ease-in-out
        "
      {...attributes}
      {...listeners}
    >
      {title} {/* Display only the title */}
    </div>
  );
}

// --- Main Kanban Board Component ---
export function KanbanBoard({ filteredTasks }: KanbanBoardProps) {
  const changeStatus = useTaskStore((state) => state.changeStatus);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);

  // State to manage the order of tasks within each column
  const [columnTasks, setColumnTasks] = useState<{ [key in TaskStatus]: Task[] }>({
    todo: [],
    'in-progress': [],
    done: [],
  });

  useEffect(() => {
    const newColumnTasks = {
      todo: filteredTasks.filter((task) => task.status === 'todo'),
      'in-progress': filteredTasks.filter((task) => task.status === 'in-progress'),
      done: filteredTasks.filter((task) => task.status === 'done'),
    };

    const columnIds: TaskStatus[] = ['todo', 'in-progress', 'done'];

    // Function to sort tasks by ID
    const sortTasksById = (tasks: Task[]) => tasks.slice().sort((a, b) => a.id.localeCompare(b.id));

    // Check if the sorted task IDs are different
    let isIdDifferent = false;
    for (const columnId of columnIds) {
      if (
        JSON.stringify(sortTasksById(newColumnTasks[columnId]).map(task => task.id)) !==
        JSON.stringify(sortTasksById(columnTasks[columnId]).map(task => task.id))
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
          newColumnTasks[columnId].some((task, index) => JSON.stringify(task) !== JSON.stringify(columnTasks[columnId][index]))
        ) {
          isContentDifferent = true;
          break;
        }
      }

      if (isContentDifferent) {
        // If content is different, update the content while preserving the existing order
        setColumnTasks(prevColumnTasks => {
          const updatedColumnTasks = {
            todo: prevColumnTasks.todo.map((task) => newColumnTasks.todo.find(t => t.id === task.id) || task),
            'in-progress': prevColumnTasks['in-progress'].map((task) => newColumnTasks['in-progress'].find(t => t.id === task.id) || task),
            done: prevColumnTasks.done.map((task) => newColumnTasks.done.find(t => t.id === task.id) || task),
          };
          return updatedColumnTasks;
        });
      }
    }
  }, [filteredTasks]);

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  // Find which column a given task ID belongs to
  const findColumnForTask = useCallback(
    (id: UniqueIdentifier): TaskStatus | undefined => {
      if (columns.some((col) => col.id === id)) {
        return id as TaskStatus;
      }
      const task = filteredTasks.find((task) => task.id === id);
      return task?.status;
    },
    [filteredTasks]
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      const pointerIntersections = pointerWithin(args);
      if (pointerIntersections.length > 0) {
        return pointerIntersections;
      }

      const intersections = rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        const activeContainerId = findColumnForTask(args.active.id);

        if (
          activeContainerId &&
          columns.some((col) => col.id === overId) &&
          overId !== activeContainerId
        ) {
          const targetColumnTasks = filteredTasks.filter((task) => task.status === overId);

          if (targetColumnTasks.length > 0) {
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  targetColumnTasks.some((task) => task.id === container.id)
              ),
            })[0]?.id;
          }
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [filteredTasks, findColumnForTask]
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

  const handleDragStart = ({ active }: { active: any }) => {
    setActiveId(active.id);
  };

  const handleDragOver = ({ active, over }: { active: any; over: any }) => {
    const overId = over?.id;
    if (!overId || active.id === overId) return;

    const activeColumnId = findColumnForTask(active.id);
    const overColumnId = findColumnForTask(overId);

    if (!activeColumnId || !overColumnId) return;
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
        const oldIndex = activeColumnTasks.findIndex(task => task.id === active.id);
        const newIndex = activeColumnTasks.findIndex(task => task.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          // Update the local state for reordering
          setColumnTasks(prevColumnTasks => {
            const updatedColumnTasks = { ...prevColumnTasks };
            updatedColumnTasks[activeColumnId] = arrayMove(activeColumnTasks, oldIndex, newIndex);
            return updatedColumnTasks;
          });
        }
      }
    } else {
      // Moving task to a different column
      const activeTask = filteredTasks.find(task => task.id === active.id);
      if (!activeTask) return;

      setColumnTasks(prevColumnTasks => {
        const newColumnTasks = { ...prevColumnTasks };

        // Remove from active column
        newColumnTasks[activeColumnId] = newColumnTasks[activeColumnId].filter(task => task.id !== active.id);

        // Find the index to insert in the over column
        let newIndex: number;
        if (columns.some((col) => col.id === overId)) {
          // If dragging over the column header/empty space
          newIndex = newColumnTasks[overColumnId].length; // Add to end
        } else {
          // If dragging over another task
          const overIndex = newColumnTasks[overColumnId].findIndex(
            (task) => task.id === overId
          );
          newIndex = overIndex !== -1 ? overIndex : newColumnTasks[overColumnId].length;
        }

        // Insert into over column
        newColumnTasks[overColumnId] = [
          ...newColumnTasks[overColumnId].slice(0, newIndex),
          activeTask,
          ...newColumnTasks[overColumnId].slice(newIndex),
        ];

        return newColumnTasks;
      });
      changeStatus(active.id, overColumnId);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const renderDragOverlayContent = () => {
    if (!activeId) return null;

    const activeTask = filteredTasks.find(task => task.id === activeId);
    if (!activeTask) return null;

    return (
      <div
        className="
            bg-default-200 p-4 rounded-md shadow-xl border border-primary-400
            transform rotate-2 transition-transform duration-100 ease-in-out
          "
      >
        {activeTask.title}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex p-4 overflow-x-auto min-h-[calc(100vh-32px)]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={columnTasks[column.id]}
          >
            <SortableContext
              items={columnTasks[column.id].map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {columnTasks[column.id].map((task) => (
                <KanbanTask
                  key={task.id}
                  id={task.id}
                  title={task.title}
                />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>

      {createPortal(
        <DragOverlay adjustScale={false}>{renderDragOverlayContent()}</DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
