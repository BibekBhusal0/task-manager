import React from "react";
import { Card, Tooltip, Avatar, cn } from "@heroui/react";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types/task";
import { useTaskStore } from "../store/task-store";
import { TaskDetailModal } from "./task-detail-modal";
import { PriorityChip } from "./priority-chip";
import { DueDateChip } from "./due-date";
import { useSortable } from "@dnd-kit/sortable";
import { TagsChip } from "./tag-chips";
import { ContextMenu } from "./task-actions-dropdown";

interface TaskCardProps {
  task: Task;
  overlay?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, overlay = false }) => {
  const viewOptions = useTaskStore().viewOptions;
  const { members } = useTaskStore();
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  const assignedMember = task.assignedTo
    ? members.find((member) => member.id === task.assignedTo)
    : null;

  return (
    <>
        <Card
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-pointer bg-default-100 opacity-100 shadow-sm transition-all hover:shadow-md",
            isDragging && "opacity-70",
            overlay && "rotate-2 cursor-grabbing bg-default-200"
          )}
          style={style}
        >
          <ContextMenu className="gap-2 p-2" onClick={() => setIsDetailOpen(true)} task={task} onEdit={() => setIsDetailOpen(true)} disabled={overlay}>
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium">{task.title}</h3>
            </div>

            {viewOptions.showTags && <TagsChip tags={task.tags} />}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {viewOptions.showPriority && (
                  <PriorityChip disableTooltip={overlay} priority={task.priority} />
                )}

                {viewOptions.showAssignee && assignedMember && (
                  <Tooltip isDisabled={overlay} content={assignedMember.name}>
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
          </ContextMenu>
        </Card>

      <TaskDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} task={task} />
    </>
  );
};
