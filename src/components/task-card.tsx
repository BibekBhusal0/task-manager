import React from "react";
import { Card, CardBody, Tooltip, Avatar, cn } from "@heroui/react";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types/task";
import { useTaskStore } from "../store/task-store";
import { TaskDetailModal } from "./task-detail-modal";
import { PriorityChip } from "./priority-chip";
import { DueDateChip } from "./due-date";
import { useSortable } from "@dnd-kit/sortable";
import { TagsChip } from "./tag-chips";

interface TaskCardProps {
  task: Task;
  overlay?: boolean
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
        onPress={() => setIsDetailOpen(true)}
        className={cn("cursor-grab shadow-sm transition-all hover:shadow-md bg-default-100 opacity-100",
          isDragging && 'opacity-70 cursor-grabbing',
          overlay && 'bg-default-200 rotate-2'
        )}
        style={style}
      >
        <CardBody className="gap-2 p-2">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium">{task.title}</h3>
          </div>

          {viewOptions.showTags &&
            <TagsChip tags={task.tags} />
          }

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {viewOptions.showPriority && <PriorityChip priority={task.priority} />}

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
        </CardBody>
      </Card>


      <TaskDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} task={task} />
    </>
  );
};
