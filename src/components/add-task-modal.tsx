import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  cn,
  Image,
  DatePicker,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTaskStore } from "../store/task-store";
import { TaskPriority, TaskStatus } from "../types/task";
import { statusConfig } from "./status-chip";
import { priorityColors } from "./priority-chip";
import { DateValue, getLocalTimeZone, } from "@internationalized/date";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: Partial<FormState>;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  tags: string[];
  dueDate: DateValue | null;
  assignedTo: string;
  priority: TaskPriority;
  newTag: string;
}

const initialFormState: FormState = {
  title: "",
  description: "",
  status: "todo",
  tags: [],
  dueDate: null,
  assignedTo: "",
  priority: "medium",
  newTag: "",
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, initialState }) => {
  const { members, addTask } = useTaskStore();

  const [formState, setFormState] = React.useState<FormState>({
    ...initialFormState,
    ...initialState,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleAddTag = () => {
    if (formState.newTag.trim() && !formState.tags.includes(formState.newTag.trim())) {
      setFormState({
        ...formState,
        tags: [...formState.tags, formState.newTag.trim()],
        newTag: "",
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormState({
      ...formState,
      tags: formState.tags.filter((t) => t !== tag),
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const newTask = {
      ...formState,
      id: `task-${Date.now()}`,
      dueDate: formState.dueDate ? formState.dueDate.toDate(getLocalTimeZone()).toISOString().slice(0, 10) : null,
      assignedTo: formState.assignedTo || null,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) setFormState({ ...initialFormState, ...initialState });
    setErrors({});
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" scrollBehavior="inside">
      <ModalContent >
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Add New Task</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Title"
                  placeholder="Enter task title"
                  name="title"
                  value={formState.title}
                  onValueChange={(value) => setFormState({ ...formState, title: value })}
                  isRequired
                  isInvalid={!!errors.title}
                  errorMessage={errors.title}
                />

                <Textarea
                  label="Description"
                  placeholder="Enter task description"
                  name="description"
                  value={formState.description}
                  onValueChange={(value) => setFormState({ ...formState, description: value })}
                  minRows={3}
                />

                <Select
                  label="Status"
                  placeholder="Select status"
                  name="status"
                  selectedKeys={[formState.status]}
                  onChange={(e) =>
                    setFormState({ ...formState, status: e.target.value as TaskStatus })
                  }
                >
                  {Object.entries(statusConfig).map(([status, option]) => (
                    <SelectItem key={status} startContent={<Icon icon={option.icon} />}>
                      {option.title}
                    </SelectItem>
                  ))}
                </Select>

                <div>
                  <p className="mb-1 text-sm">Tags</p>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {formState.tags.map((tag) => (
                      <Chip key={tag} onClose={() => handleRemoveTag(tag)} variant="flat">
                        #{tag}
                      </Chip>
                    ))}
                    {formState.tags.length === 0 && (
                      <span className="text-sm text-default-400">No tags added</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      name="newTag"
                      value={formState.newTag}
                      onValueChange={(value) => setFormState({ ...formState, newTag: value })}
                      onKeyDown={(e: any) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onPress={handleAddTag}>Add</Button>
                  </div>
                </div>

                <DatePicker
                  label="Due Date"
                  name="dueDate"
                  //@ts-ignore
                  value={formState.dueDate}
                  onChange={(date) => setFormState({ ...formState, dueDate: date })}
                />

                <Select
                  label="Assigned To"
                  placeholder="Select team member"
                  name="assignedTo"
                  selectedKeys={formState.assignedTo ? [formState.assignedTo] : []}
                  onChange={(e) => setFormState({ ...formState, assignedTo: e.target.value })}
                >
                  {members.map((member) => (
                    <SelectItem
                      key={member.id}
                      startContent={
                        <div className="flex items-center gap-2">
                          <div
                            className={cn("h-2 w-2 rounded-full", member.isOnline ? "bg-success" : "bg-default-300")}
                          />
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        </div>
                      }
                    >
                      {member.name}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Priority"
                  placeholder="Select priority"
                  name="priority"
                  selectedKeys={[formState.priority]}
                  onChange={(e) =>
                    setFormState({ ...formState, priority: e.target.value as TaskPriority })
                  }
                >
                  {Object.entries(priorityColors).map(([priority, color]) => (
                    <SelectItem
                      key={priority}
                      startContent={<div className={cn(`h-2 w-2 rounded-full bg-${color}`)} />}
                      className="capitalize"
                    >
                      {priority}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Create Task
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

