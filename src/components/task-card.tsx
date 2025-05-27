import React from "react";
import { Card, CardBody, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Tooltip, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task, ViewOptions } from "../types/task";
import { useTaskStore } from "../store/task-store";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "../utils/date-utils";
import { TaskDetailModal } from "./task-detail-modal";

interface TaskCardProps {
  task: Task;
  viewOptions: ViewOptions;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, viewOptions }) => {
  const { members, updateTask, deleteTask } = useTaskStore();
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const { animationsEnabled } = useSettingsStore();
  
  // Set up draggable
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: 10,
  } : undefined;

  // Find assigned member
  const assignedMember = task.assignedTo 
    ? members.find(member => member.id === task.assignedTo)
    : null;

  // Format due date
  const formattedDueDate = task.dueDate 
    ? formatDistanceToNow(new Date(task.dueDate))
    : null;

  // Determine if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  
  // Priority colors
  const priorityColors = {
    low: "success",
    medium: "warning",
    high: "danger",
  };

  const handleStatusChange = (status: string) => {
    updateTask(task.id, { status: status as any });
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <>
      <motion.div
        layout={animationsEnabled ? true : false}
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
          className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
          style={style}
        >
          <CardBody className="p-3 gap-2">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-sm">{task.title}</h3>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button 
                    isIconOnly 
                    variant="light" 
                    size="sm" 
                    className="text-default-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon icon="lucide:more-horizontal" className="text-sm" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Task actions">
                  <DropdownItem 
                    key="edit"
                    startContent={<Icon icon="lucide:edit" className="text-sm" />}
                    onPress={() => setIsDetailOpen(true)}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem 
                    key="todo" 
                    startContent={<Icon icon="lucide:list-todo" className="text-sm" />}
                    onPress={() => handleStatusChange("todo")}
                  >
                    Move to To Do
                  </DropdownItem>
                  <DropdownItem 
                    key="in-progress" 
                    startContent={<Icon icon="lucide:loader" className="text-sm" />}
                    onPress={() => handleStatusChange("in-progress")}
                  >
                    Move to In Progress
                  </DropdownItem>
                  <DropdownItem 
                    key="done" 
                    startContent={<Icon icon="lucide:check" className="text-sm" />}
                    onPress={() => handleStatusChange("done")}
                  >
                    Move to Done
                  </DropdownItem>
                  <DropdownItem 
                    key="delete" 
                    color="danger"
                    startContent={<Icon icon="lucide:trash" className="text-sm" />}
                    onPress={handleDelete}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            
            {viewOptions.showTags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {task.tags.map(tag => (
                  <Chip 
                    key={tag} 
                    size="sm" 
                    variant="flat" 
                    className="text-xs"
                  >
                    #{tag}
                  </Chip>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                {viewOptions.showPriority && (
                  <Tooltip content={`Priority: ${task.priority}`}>
                    <div className={`w-2 h-2 rounded-full bg-${priorityColors[task.priority]}`} />
                  </Tooltip>
                )}
                
                {viewOptions.showAssignee && assignedMember && (
                  <Tooltip content={assignedMember.name}>
                    <Avatar 
                      src={assignedMember.avatar} 
                      name={assignedMember.name} 
                      size="sm" 
                      className="w-6 h-6"
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
      
      <TaskDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        task={task}
      />
    </>
  );
};

import { useSettingsStore } from "../store/settings-store";