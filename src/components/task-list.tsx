import React from "react";
import { Card, CardBody, Divider } from "@heroui/react";
import { useTaskStore } from "../store/task-store";
import { AnimatePresence } from "framer-motion";
import { TaskListItem } from "./task-list-item";
import { Task } from "../types/task";

interface TaskListProps {
  filteredTasks: Task[];
}

export const TaskList: React.FC<TaskListProps> = ({ filteredTasks }) => {
  const { viewOptions } = useTaskStore();

  return (
    <Card>
      <CardBody className="p-0">
        <div>
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <TaskListItem task={task} viewOptions={viewOptions} />
                {index < filteredTasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div className="py-12 text-center text-default-400">No tasks match your filters</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
