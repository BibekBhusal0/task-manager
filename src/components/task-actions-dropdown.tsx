import React, { Fragment } from "react";
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

export const DropdownList = React.forwardRef<HTMLUListElement, TaskActionsDropdownProps & { onClose?: () => void }>(({
  onEdit,
  task,
  onClose = () => { },
}, ref) => {
  const { deleteTask, changeStatus } = useTaskStore();

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };
  const handleEdit = () => {
    onEdit();
    onClose();
  };

  return (
    <Listbox ref={ref} selectionMode="none" aria-label="Task actions">
      <ListboxItem
        key="edit"
        textValue="edit"
        startContent={<Icon icon="lucide:edit" className="text-sm" />}
        onPress={handleEdit}
      >
        Edit
      </ListboxItem>
      <>
        {Object.entries(statusConfig).map(([status, config]) => (
          <Fragment key={status}>
            {status !== task.status && (
              <ListboxItem
                key={status}
                textValue={status}
                startContent={<Icon icon={config.icon} className="text-sm" />}
                onPress={() => changeStatus(task.id, status as TaskStatus)}
              >
                Move to {config.title}
              </ListboxItem>
            )}
          </Fragment>
        ))}
      </>
      <ListboxItem
        key="delete"
        textValue="delete"
        color="danger"
        startContent={<Icon icon="lucide:trash" className="text-sm" />}
        onPress={handleDelete}
      >
        Delete
      </ListboxItem>
    </Listbox>
  );
});
DropdownList.displayName = "DropdownList";

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
        <DropdownList {...props} onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

type ContextMenuProps = React.HTMLAttributes<HTMLDivElement> &
  TaskActionsDropdownProps & {
    disabled?: boolean;
  };

export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ children, disabled = false, task, onEdit, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const contentRef = React.useRef<HTMLUListElement>(null);
    const [menuDimensions, setMenuDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
      const handleScroll = () => {
        if (isOpen) setIsOpen(false);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [isOpen]);

    React.useEffect(() => {
      if (contentRef.current) {
        setMenuDimensions({
          width: contentRef.current.offsetWidth,
          height: contentRef.current.offsetHeight,
        });
      }
    }, [isOpen]);

    const handleContextMenu = React.useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        if (disabled) return;
        setPosition(() => {
          let x = event.clientX;
          let y = event.clientY;
          const screenWidth = screen.width;
          const screenHeight = screen.height;
          if (x + menuDimensions.width > screenWidth) x = x - menuDimensions.width
          if (y + menuDimensions.height > screenHeight) y = y - menuDimensions.height
          return { x, y }
        })
        setIsOpen(true);
      },
      [disabled,menuDimensions]
    );

    return (
      <Popover
        isOpen={isOpen}
        motionProps ={{exit: {}}}
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
        <div className="w-full" onContextMenu={handleContextMenu} ref={ref} {...props}>
          {children}
        </div>
        <PopoverContent >
          <DropdownList onClose={() => setIsOpen(false)} {...{ task, onEdit }} ref={contentRef} />
        </PopoverContent>
      </Popover>
    );
  }
);

ContextMenu.displayName = "ContextMenu";
