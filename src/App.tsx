import React from "react";
import { Navbar, NavbarBrand, NavbarContent, Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TaskDashboard } from "./components/task-dashboard";
import { AddTaskModal } from "./components/add-task-modal";
import { TeamMembersPanel } from "./components/team-members-panel";
import { SettingsModal } from "./components/settings-modal";
import { useTaskStore } from "./store/task-store";
import { useSettingsStore } from "./store/settings-store";

export default function App() {
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [isTeamPanelOpen, setIsTeamPanelOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { theme, toggleTheme } = useSettingsStore();
  const { selectedMember, clearSelectedMember } = useTaskStore();

  // Apply theme from local storage on mount
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar maxWidth="full" className="border-b border-divider">
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:layout-grid" className="text-xl text-primary" />
            <p className="font-semibold text-inherit">TaskFlow</p>
          </div>
        </NavbarBrand>
        <NavbarContent justify="end" className="gap-4">
          {selectedMember && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-default-500">
                Filtered by: <span className="font-medium">{selectedMember.name}</span>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={clearSelectedMember}
                className="text-default-500"
              >
                <Icon icon="lucide:x" className="text-sm" />
              </Button>
            </div>
          )}
          <Tooltip content="Add new task">
            <Button
              isIconOnly
              variant="flat"
              onPress={() => setIsAddTaskOpen(true)}
              className="text-default-600"
            >
              <Icon icon="lucide:plus" />
            </Button>
          </Tooltip>
          <Tooltip content="Team members">
            <Button
              isIconOnly
              variant="flat"
              onPress={() => setIsTeamPanelOpen(true)}
              className="text-default-600"
            >
              <Icon icon="lucide:users" />
            </Button>
          </Tooltip>
          <Tooltip content="Settings">
            <Button
              isIconOnly
              variant="flat"
              onPress={() => setIsSettingsOpen(true)}
              className="text-default-600"
            >
              <Icon icon="lucide:settings" />
            </Button>
          </Tooltip>
          <Tooltip content={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            <Button isIconOnly variant="flat" onPress={toggleTheme} className="text-default-600">
              <Icon icon={theme === "dark" ? "lucide:sun" : "lucide:moon"} />
            </Button>
          </Tooltip>
        </NavbarContent>
      </Navbar>

      <main className="flex-grow p-4 md:p-6">
        <TaskDashboard />
      </main>

      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />
      <TeamMembersPanel isOpen={isTeamPanelOpen} onClose={() => setIsTeamPanelOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
