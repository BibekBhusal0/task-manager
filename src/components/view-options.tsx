import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { useTaskStore } from "../store/task-store";
import { Icon } from "@iconify/react";

export const ViewOptions: React.FC = () => {
  const { viewOptions, updateViewOptions } = useTaskStore();

  const selectedKeys = React.useMemo(() => {
    const keys: string[] = [];
    for (const key in viewOptions) {
      if (viewOptions[key as keyof typeof viewOptions]) {
        keys.push(key);
      }
    }
    return keys;
  }, [viewOptions]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="flat"
          size="sm"
        >
          <Icon icon="lucide:sliders-horizontal" className="text-sm" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="View options"
        selectionMode="multiple"
        selectedKeys={new Set(selectedKeys)}
        closeOnSelect = {false}
        onSelectionChange={(keys: Set<string>) => {
          const newOptions = { ...viewOptions };
          for (const key in viewOptions) {
            newOptions[key as keyof typeof viewOptions] = keys.has(key);
          }
          updateViewOptions(newOptions);
        }}
      >
        <DropdownItem key="showTags">Show Tags</DropdownItem>
        <DropdownItem key="showAssignee">Show Assignee</DropdownItem>
        <DropdownItem key="showDueDate">Show Due Date</DropdownItem>
        <DropdownItem key="showPriority">Show Priority</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

