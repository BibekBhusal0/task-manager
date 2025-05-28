import React from "react";
import { Card, CardBody, CardHeader, cn, Divider } from "@heroui/react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useTaskStore } from "../store/task-store";
import { TaskCard } from "./task-card";
import { TaskStatus } from "../types/task";
import { Task } from "../types/task";
import { statusConfig } from "./status-chip";
import { Icon } from "@iconify/react";


interface KanbanBoardProps {
  filteredTasks: Task[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ filteredTasks }) => {
  const { tasks, changeStatus: moveTask, viewOptions } = useTaskStore();

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      moveTask(taskId, newStatus);
    }
  };

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    const grouped = {
      todo: [] as typeof tasks,
      "in-progress": [] as typeof tasks,
      done: [] as typeof tasks,
    };

    filteredTasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card key={status} id={status} className="h-full">
            <CardHeader className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon icon = {config.icon} className = { cn (`text-${config.color}`)}/>
                <span className="font-medium">{config.title}</span>
                <span className="text-sm text-default-400">{tasksByStatus[status as TaskStatus].length}</span>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="max-h-[calc(100vh-220px)] overflow-y-auto p-3">
              <div
                className="flex flex-col gap-3"
              >
                {tasksByStatus[status as TaskStatus].map((task) => (
                  <TaskCard key={task.id} task={task} viewOptions={viewOptions} />
                ))}
                {tasksByStatus[status as TaskStatus].length === 0 && (
                  <div className="py-8 text-center text-sm text-default-400">No tasks</div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </DndContext>
  );
};

