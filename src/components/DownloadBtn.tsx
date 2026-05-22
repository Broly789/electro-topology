import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "@xyflow/react";
import { IconButton } from "@chakra-ui/react";
import { Download } from "react-bootstrap-icons";
import { toPng } from "html-to-image";
import { useCallback, useState } from "react";

// 导出配置（可灵活调整）
const EXPORT_CONFIG = {
  WIDTH: 1024,
  HEIGHT: 768,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2,
  DEFAULT_ZOOM: 1,
  FILE_NAME: "flow-diagram.png",
};

// 下载工具函数（增加清理逻辑）
const downloadImage = (dataUrl: string) => {
  const a = document.createElement("a");
  a.download = EXPORT_CONFIG.FILE_NAME;
  a.href = dataUrl;
  a.click();

  // 清理DOM元素，避免内存泄漏
  setTimeout(() => {
    URL.revokeObjectURL(dataUrl);
    a.remove();
  }, 100);
};

const DownloadBtn = () => {
  const { getNodes } = useReactFlow();
  const [loading, setLoading] = useState(false);

  // 缓存函数，避免重渲染
  const handleDownload = useCallback(async () => {
    // 1. 防重复点击
    if (loading) return;

    const nodes = getNodes();
    // 2. 无节点判断
    if (nodes.length === 0) {
      return;
    }

    try {
      setLoading(true);
      const nodeBounds = getNodesBounds(nodes);
      const { x, y, zoom } = getViewportForBounds(
        nodeBounds,
        EXPORT_CONFIG.WIDTH,
        EXPORT_CONFIG.HEIGHT,
        EXPORT_CONFIG.MIN_ZOOM,
        EXPORT_CONFIG.MAX_ZOOM,
        EXPORT_CONFIG.DEFAULT_ZOOM,
      );

      // 3. 稳定获取 React Flow 容器（官方推荐的选择器）
      const reactFlowElement = document.querySelector<HTMLDivElement>(
        ".react-flow__viewport",
      );
      if (!reactFlowElement) {
        throw new Error("未找到画布容器");
      }

      // 4. 高清导出配置（核心优化：清晰度）
      const dataUrl = await toPng(reactFlowElement, {
        width: EXPORT_CONFIG.WIDTH,
        height: EXPORT_CONFIG.HEIGHT,
        // pixelRatio: window.devicePixelRatio * 2, // 高清关键
        backgroundColor: "#ffffff", // 白底导出，避免透明背景黑边
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
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  }, [getNodes, loading]);

  return (
    <IconButton
      aria-label="Download Flow"
      size="xs"
      onClick={handleDownload}
      loading={loading} // 加载状态
      disabled={loading} // 加载中禁用
    >
      <Download />
    </IconButton>
  );
};

export default DownloadBtn;
