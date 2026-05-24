import { Flex, IconButton, Text } from "@chakra-ui/react";
import { Panel } from "@xyflow/react";
import { COMPONENTS } from "@/constants";
import type { ElectricalComponentKeysType } from "@/types";
import { Floppy, Sun, Moon } from "react-bootstrap-icons";
import DownloadBtn from "./DownloadBtn";

interface ThemeToggleProps {
  isDark: boolean;
  colorMode: string;
  onToggle: () => void;
}

/** 深色主题切换按钮 */
export function ThemeToggle({ isDark, colorMode, onToggle }: ThemeToggleProps) {
  return (
    <Panel position="top-left">
      <IconButton
        onClick={onToggle}
        variant="surface"
        colorPalette={isDark ? "blackAlpha" : "orange"}
        size="sm"
      >
        {colorMode === "light" ? <Sun /> : <Moon />}
      </IconButton>
    </Panel>
  );
}

interface ProjectPanelProps {
  onSave: () => void;
  isPending: boolean;
}

/** 保存 + 下载 */
export function ProjectPanel({ onSave, isPending }: ProjectPanelProps) {
  return (
    <div>
      <Text fontSize="sm">Project</Text>
      <Flex mt={1} gap={1} flexWrap="wrap">
        <IconButton
          aria-label="Save"
          size="xs"
          variant="subtle"
          onClick={onSave}
          loading={isPending}
        >
          <Floppy />
        </IconButton>
        <DownloadBtn />
      </Flex>
    </div>
  );
}

interface ComponentsPanelProps {
  onDragStart: (
    event: React.DragEvent<HTMLButtonElement>,
    type: ElectricalComponentKeysType,
  ) => void;
}

/** 可拖拽的元件列表 */
export function ComponentsPanel({ onDragStart }: ComponentsPanelProps) {
  return (
    <div>
      <Text fontSize="sm">Components</Text>
      <Flex mt={1} gap={1} flexWrap="wrap">
        {COMPONENTS.map((component) => (
          <IconButton
            key={component.label}
            size="sm"
            aria-label={component.label}
            draggable
            variant="subtle"
            onDragStart={(event) => onDragStart(event, component.type)}
          >
            {component.icon}
          </IconButton>
        ))}
      </Flex>
    </div>
  );
}
