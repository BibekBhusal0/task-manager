import React from "react";
import { useTaskStore } from "../store/task-store";
import { Task, TaskStatus } from "../types/task";
import {
  Button,
  Listbox,
  ListboxItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
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
    <Listbox selectionMode="none" aria-label="Task actions">
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
  );
};

export const TaskActionsDropdown: React.FC<TaskActionsDropdownProps> = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      placement="bottom-end"
      shouldCloseOnBlur
      shouldCloseOnScroll
    >
      <PopoverTrigger>
        <Button isIconOnly variant="light" size="sm" className="text-default-400">
          <Icon icon="lucide:more-horizontal" className="text-sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Task actions">
        <DropdownList
          {...props}
          onEdit={() => {
            props.onEdit();
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

type ContextMenuProps = React.HTMLAttributes<HTMLDivElement> & TaskActionsDropdownProps & {
  disabled?: boolean;
}

export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ children, disabled = false, onEdit, task, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
      const handleScroll = () => {
        if (isOpen) setIsOpen(false);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [isOpen]);

    const handleContextMenu = React.useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      if (disabled) return;
      setPosition({ x: event.clientX, y: event.clientY });
      setIsOpen(true);
    }, [disabled,]);

    return (
      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        shouldCloseOnBlur
        shouldCloseOnScroll
        onClose={() => setIsOpen(false)}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
        }}
      >
        <div
          className="w-full"
          onContextMenu={handleContextMenu}
          ref={ref}
          {...props}
        >
          {children}
        </div>
        <PopoverContent>
          <DropdownList
            onEdit={() => {
              onEdit();
              setIsOpen(false);
            }}
            task={task}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

ContextMenu.displayName = "ContextMenu";

