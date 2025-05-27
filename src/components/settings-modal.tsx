import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSettingsStore } from "../store/settings-store";
import { getModalMotionProps } from "../utils/getModalMotionProps";
// import { motion } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    toggleTheme,
    animationsEnabled,
    toggleAnimations,
    compactMode,
    toggleCompactMode,
  } = useSettingsStore();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="sm"
      motionProps={
        getModalMotionProps(animationsEnabled)
      }
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-default-500">
                      {theme === "dark" ? "Dark mode" : "Light mode"}
                    </p>
                  </div>
                  <Switch
                    isSelected={theme === "dark"}
                    onValueChange={toggleTheme}
                    startContent={<Icon icon="lucide:sun" />}
                    endContent={<Icon icon="lucide:moon" />}
                  />
                </div>

                <Divider />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Animations</p>
                    <p className="text-sm text-default-500">Enable or disable animations</p>
                  </div>
                  <Switch isSelected={animationsEnabled} onValueChange={toggleAnimations} />
                </div>

                <Divider />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-default-500">Reduce spacing in the UI</p>
                  </div>
                  <Switch isSelected={compactMode} onValueChange={toggleCompactMode} />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
