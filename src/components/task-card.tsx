import React from "react";
import { Card, CardBody, Chip, Tooltip, Avatar } from "@heroui/react";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types/task";
import { useTaskStore } from "../store/task-store";
import { motion } from "framer-motion";
import { TaskDetailModal } from "./task-detail-modal";
import { PriorityChip } from "./priority-chip";
import { DueDateChip } from "./due-date";
import { useSortable } from "@dnd-kit/sortable";

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const viewOptions = useTaskStore().viewOptions;
  const { members } = useTaskStore();
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.7 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  // Find assigned member
  const assignedMember = task.assignedTo
    ? members.find((member) => member.id === task.assignedTo)
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          onPress={() => setIsDetailOpen(true)}
          className="cursor-grab shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
          style={style}
        >
          <CardBody className="gap-2 p-3">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium">{task.title}</h3>
            </div>

            {viewOptions.showTags && task.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Chip key={tag} size="sm" variant="flat" className="text-xs">
                    #{tag}
                  </Chip>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {viewOptions.showPriority && <PriorityChip priority={task.priority} />}

                {viewOptions.showAssignee && assignedMember && (
                  <Tooltip content={assignedMember.name}>
                    <Avatar
                      src={assignedMember.avatar}
                      name={assignedMember.name}
                      size="sm"
                      className="h-6 w-6"
                    />
                  </Tooltip>
                )}
              </div>

              {viewOptions.showDueDate && task.dueDate && <DueDateChip dueDate={task.dueDate} />}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <TaskDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} task={task} />
    </>
  );
};
