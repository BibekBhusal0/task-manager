import React from "react";
import { Navbar, NavbarBrand, NavbarContent, Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TaskDashboard } from "./components/task-dashboard";
import { AddTaskModal } from "./components/add-task-modal";
import { TeamMembersPanel } from "./components/team-members-panel";
import { useTaskStore } from "./store/task-store";
import { useTheme } from "@heroui/use-theme";

export default function App() {
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [isTeamPanelOpen, setIsTeamPanelOpen] = React.useState(false);
  const { selectedMember, clearSelectedMember } = useTaskStore();
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navButtons = [
    {
      content: "Add new task",
      icon: "lucide:plus",
      onPress: () => setIsAddTaskOpen(true),
    },
    {
      content: "Team members",
      icon: "lucide:users",
      onPress: () => setIsTeamPanelOpen(true),
    },
    {
      content: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      icon: theme === "dark" ? "lucide:sun" : "lucide:moon",
      onPress: toggleTheme,
    },
  ];

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
          {navButtons.map((button, i) => (
            <Tooltip key={i} content={button.content}>
              <Button isIconOnly variant="flat" onPress={button.onPress} className="text-lg">
                <Icon icon={button.icon} />
              </Button>
            </Tooltip>
          ))}
        </NavbarContent>
      </Navbar>

      <main className="flex-grow p-4 md:p-6">
        <TaskDashboard />
      </main>

      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />
      <TeamMembersPanel isOpen={isTeamPanelOpen} onClose={() => setIsTeamPanelOpen(false)} />
    </div>
  );
}
