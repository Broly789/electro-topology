import { getViewportForBounds, useReactFlow } from "@xyflow/react";
import { IconButton } from "@chakra-ui/react";
import { Download } from "react-bootstrap-icons";
import { toPng } from "html-to-image";
import { useCallback, useState } from "react";
import { useColorMode } from "@/components/ui/color-mode";

const EXPORT_CONFIG = {
  WIDTH: 1024,
  HEIGHT: 768,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2,
  DEFAULT_ZOOM: 1,
  FILE_NAME: "flow-diagram.png",
};

const downloadImage = (dataUrl: string) => {
  const a = document.createElement("a");
  a.download = EXPORT_CONFIG.FILE_NAME;
  a.href = dataUrl;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(dataUrl);
    a.remove();
  }, 100);
};

const DownloadBtn = () => {
  const { getNodes, getNodesBounds } = useReactFlow();
  const [loading, setLoading] = useState(false);
  const { colorMode } = useColorMode();
  const bgColor = colorMode === "dark" ? "#1a1a1a" : "#ffffff";

  const handleDownload = useCallback(async () => {
    if (loading) return;

    const nodes = getNodes();
    if (nodes.length === 0) return;

    try {
      setLoading(true);

      // 使用 useReactFlow 导出的 getNodesBounds（内部持有 nodeLookup，支持子节点）
      const nodeBounds = getNodesBounds(nodes);
      const { x, y, zoom } = getViewportForBounds(
        nodeBounds,
        EXPORT_CONFIG.WIDTH,
        EXPORT_CONFIG.HEIGHT,
        EXPORT_CONFIG.MIN_ZOOM,
        EXPORT_CONFIG.MAX_ZOOM,
        EXPORT_CONFIG.DEFAULT_ZOOM,
      );

      const reactFlowElement = document.querySelector<HTMLDivElement>(
        ".react-flow__viewport",
      );
      if (!reactFlowElement) {
        throw new Error("未找到画布容器");
      }

      const dataUrl = await toPng(reactFlowElement, {
        width: EXPORT_CONFIG.WIDTH,
        height: EXPORT_CONFIG.HEIGHT,
        backgroundColor: bgColor,
        style: {
          width: `${EXPORT_CONFIG.WIDTH}px`,
          height: `${EXPORT_CONFIG.HEIGHT}px`,
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        },
      });

      downloadImage(dataUrl);
    } catch (error) {
      console.error("导出画布失败：", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [getNodes, getNodesBounds, loading, bgColor]);

  return (
    <IconButton
      aria-label="Download Flow"
      size="xs"
      variant="subtle"
      onClick={handleDownload}
      loading={loading}
      disabled={loading}
    >
      <Download />
    </IconButton>
  );
};

export default DownloadBtn;
