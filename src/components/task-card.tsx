import React from "react";
import {
  Card,
  CardBody,
  Chip,
  Tooltip,
  Avatar,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types/task";
import { useTaskStore } from "../store/task-store";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "../utils/date-utils";
import { TaskDetailModal } from "./task-detail-modal";
import { PriorityChip, TaskActionsDropdown } from "./task-actions-dropdown";

interface TaskCardProps {
  task: Task;
  viewOptions: any;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, viewOptions }) => {
  const { members, } = useTaskStore();
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
      transform: CSS.Translate.toString(transform),
      zIndex: 10,
    }
    : undefined;

  // Find assigned member
  const assignedMember = task.assignedTo
    ? members.find((member) => member.id === task.assignedTo)
    : null;
  const formattedDueDate = task.dueDate ? formatDistanceToNow(new Date(task.dueDate)) : null;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

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
          isPressable
          onPress={() => setIsDetailOpen(true)}
          className="cursor-grab shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
          style={style}
        >
          <CardBody className="gap-2 p-3">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium">{task.title}</h3>
              <TaskActionsDropdown
                task={task}
                onEdit={() => setIsDetailOpen(true)}
              />
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
                {viewOptions.showPriority && (
                  <PriorityChip priority={task.priority} />
                )}

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

              {viewOptions.showDueDate && formattedDueDate && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={isOverdue ? "danger" : "default"}
                  startContent={<Icon icon="lucide:clock" className="text-xs" />}
                  className="text-xs"
                >
                  {formattedDueDate}
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <TaskDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} task={task} />
    </>
  );
};

