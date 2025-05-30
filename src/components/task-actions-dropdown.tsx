import React from "react";
import { useTaskStore } from "../store/task-store";
import { Task, TaskStatus } from "../types/task";
import { Button, Listbox, ListboxItem, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { Icon } from "@iconify/react";
import { statusConfig } from "./status-chip";

interface TaskActionsDropdownProps {
  task: Task;
  onEdit: () => void;
}

export const DropdownList: React.FC<TaskActionsDropdownProps> = ({ onEdit, task }) => {
  const { deleteTask, changeStatus } = useTaskStore();

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <Listbox selectionMode = 'none' aria-label="Task actions">
      <ListboxItem
        key="edit"
        startContent={<Icon icon="lucide:edit" className="text-sm" />}
        onPress={onEdit}
      >
        Edit
      </ListboxItem>
      <>
        {Object.entries(statusConfig).map(([status, config]) => (
          <>
            {status !== task.status && (
              <ListboxItem
                key={status}
                startContent={<Icon icon={config.icon} className="text-sm" />}
                onPress={() => changeStatus(task.id, status as TaskStatus)}
              >
                Move to {config.title}
              </ListboxItem>
            )}
          </>
        ))}
      </>
      <ListboxItem
        key="delete"
        color="danger"
        startContent={<Icon icon="lucide:trash" className="text-sm" />}
        onPress={handleDelete}
      >
        Delete
      </ListboxItem>
    </Listbox>
  )
}

export const TaskActionsDropdown: React.FC<TaskActionsDropdownProps> = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Popover isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)} placement="bottom-end" shouldCloseOnBlur shouldCloseOnScroll>
      <PopoverTrigger>
        <Button isIconOnly variant="light" size="sm" className="text-default-400">
          <Icon icon="lucide:more-horizontal" className="text-sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Task actions">
        <DropdownList {...props} onEdit={() => { props.onEdit(); setIsOpen(false) }} />
      </PopoverContent>
    </Popover>
  );
};
