import React from "react";
import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTaskStore } from "../store/task-store";

export const FilterToolbar: React.FC = () => {
  const { filter, updateFilter, tasks, viewType } = useTaskStore();

  // Extract unique tags from all tasks
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      task.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [tasks]);

  const handleSearchChange = (value: string) => {
    updateFilter({ search: value });
  };

  const currentFilter = filter.sortBy + "-" + filter.sortDirection;
  // __AUTO_GENERATED_PRINT_VAR_START__
  console.log("FilterToolbar currentFilter:", currentFilter); // __AUTO_GENERATED_PRINT_VAR_END__

  const handleSortChange = (key: string) => {
    if (key === "reset") {
      updateFilter({ sortBy: "createdAt", sortDirection: "desc" });
      return;
    }

    const [sortBy, sortDirection] = key.split("-") as [any, any];
    updateFilter({ sortBy, sortDirection });
  };

  const clearFilters = () => {
    updateFilter({
      search: "",
      tags: [],
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  };

  const hasActiveFilters =
    filter.search ||
    filter.tags.length > 0 ||
    filter.sortBy !== "createdAt" ||
    filter.sortDirection !== "desc";

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <div className="w-full sm:w-64 md:w-80">
        <Input
          placeholder="Search tasks..."
          value={filter.search}
          onValueChange={handleSearchChange}
          startContent={<Icon icon="lucide:search" className="text-default-400" />}
          size="sm"
          variant="bordered"
          classNames={{
            inputWrapper: "h-9",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              size="sm"
              startContent={<Icon icon="lucide:tag" className="text-sm" />}
            >
              Tags
              {filter.tags.length > 0 && (
                <Chip size="sm" variant="flat" color="primary" className="ml-1">
                  {filter.tags.length}
                </Chip>
              )}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Tag filters"
            selectionMode="multiple"
            selectedKeys={new Set(filter.tags)}
            className="max-h-80 overflow-auto"
            onSelectionChange={(keys) => {
              updateFilter({ tags: Array.from(keys as Set<string>) });
            }}
          >
            {allTags.map((tag) => (
              <DropdownItem key={tag}>#{tag}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {viewType !== "kanban" && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                size="sm"
                startContent={<Icon icon="lucide:arrow-up-down" className="text-sm" />}
              >
                Sort
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Sort options"
              selectedKeys={[currentFilter]}
              selectionMode="single"
              onAction={handleSortChange}
            >
              <DropdownItem key="createdAt-desc" startContent={<Icon icon="lucide:calendar" />}>
                Newest first
              </DropdownItem>
              <DropdownItem key="createdAt-asc" startContent={<Icon icon="lucide:calendar" />}>
                Oldest first
              </DropdownItem>
              <DropdownItem key="dueDate-asc" startContent={<Icon icon="lucide:clock" />}>
                Due soon
              </DropdownItem>
              <DropdownItem key="priority-desc" startContent={<Icon icon="lucide:flag" />}>
                Highest priority
              </DropdownItem>
              <DropdownItem
                key="reset"
                startContent={<Icon icon="lucide:rotate-ccw" />}
                color="danger"
              >
                Reset sorting
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}

        {hasActiveFilters && (
          <Button
            variant="flat"
            size="sm"
            color="danger"
            onPress={clearFilters}
            startContent={<Icon icon="lucide:x" className="text-sm" />}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
