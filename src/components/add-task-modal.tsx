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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTaskStore } from "../store/task-store";
import { TaskPriority, TaskStatus } from "../types/task";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { members, addTask } = useTaskStore();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("todo");
  const [tags, setTags] = React.useState<string[]>([]);
  const [dueDate, setDueDate] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState<string>("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [newTag, setNewTag] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form on close
  React.useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setTags([]);
      setDueDate("");
      setAssignedTo("");
      setPriority("medium");
      setNewTag("");
      setErrors({});
    }
  }, [isOpen]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      status,
      tags,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assignedTo: assignedTo || null,
      priority,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    onClose();
  };

  const statusOptions = [
    { key: "todo", label: "To Do", icon: "lucide:list-todo" },
    { key: "in-progress", label: "In Progress", icon: "lucide:loader" },
    { key: "done", label: "Done", icon: "lucide:check" },
  ];

  const priorityOptions = [
    { key: "low", label: "Low", color: "success" },
    { key: "medium", label: "Medium", color: "warning" },
    { key: "high", label: "High", color: "danger" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Add New Task</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Title"
                  placeholder="Enter task title"
                  value={title}
                  onValueChange={setTitle}
                  isRequired
                  isInvalid={!!errors.title}
                  errorMessage={errors.title}
                />

                <Textarea
                  label="Description"
                  placeholder="Enter task description"
                  value={description}
                  onValueChange={setDescription}
                  minRows={3}
                />

                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={[status]}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.key} startContent={<Icon icon={option.icon} />}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <div>
                  <p className="mb-1 text-sm">Tags</p>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Chip key={tag} onClose={() => handleRemoveTag(tag)} variant="flat">
                        #{tag}
                      </Chip>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-sm text-default-400">No tags added</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onValueChange={setNewTag}
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

                <Input
                  type="date"
                  label="Due Date"
                  placeholder="Select due date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />

                <Select
                  label="Assigned To"
                  placeholder="Select team member"
                  selectedKeys={assignedTo ? [assignedTo] : []}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  {members.map((member) => (
                    <SelectItem
                      key={member.id}
                      startContent={
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${member.isOnline ? "bg-success" : "bg-default-300"}`}
                          />
                          <img
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
                  selectedKeys={[priority]}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                >
                  {priorityOptions.map((option) => (
                    <SelectItem
                      key={option.key}
                      startContent={<div className={`h-2 w-2 rounded-full bg-${option.color}`} />}
                    >
                      {option.label}
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
