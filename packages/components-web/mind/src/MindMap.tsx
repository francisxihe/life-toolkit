import React, { useEffect, useState } from 'react';
import { Graph } from '@antv/x6';
import { MindMapProvider, useMindMapContext } from './context';
import { MindMapData, MindMapOptions } from './types';
import MindMapToolbar from './features/MindMapToolbar';
import NodeEditor from './features/NodeEditor';
import { ExportModal, ImportModal } from './features/ExportImportModals';
import MiniMapContainer from './features/MiniMap';
import './style.css';
import MindMapGraph from './graph';
interface EnhancedMindMapProps {
  data: MindMapData | null;
  options?: Partial<MindMapOptions>;
  onChange?: (data: MindMapData | null) => void;
  onNodeClick?: (nodeId: string) => void;
  showToolbar?: boolean;
  className?: string;
  onGraphReady?: (graph: Graph) => void;
  minimapVisible?: boolean;
  onFullscreen?: () => void;
  onExport?: () => void;
  onToggleMinimap?: (visible: boolean) => void;
  MindMapNode?: React.ComponentType<any>;
}

/**
 * 内部MindMap组件
 * 使用MindMapContext中的状态和方法
 */
const InternalMindMap: React.FC<EnhancedMindMapProps> = ({
  options = {},
  onChange,
  onNodeClick,
  showToolbar = true,
  className = '',
  onGraphReady,
  minimapVisible = false,
  onFullscreen,
  onExport,
  onToggleMinimap,
  MindMapNode,
}) => {
  const { mindMapData, setMindMapData, selectedNodeId, containerRef } = useMindMapContext();

  const [nodeEditorVisible, setNodeEditorVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);

  // 当数据变化时触发 onChange
  useEffect(() => {
    if (onChange) {
      onChange(mindMapData);
    }
  }, [mindMapData, onChange]);

  // 导入数据
  const handleImport = (data: MindMapData) => {
    setMindMapData(data);
  };

  return (
    <div
      ref={containerRef}
      className={`mind-map w-full h-full flex flex-col ${className}`}
      style={{ position: 'relative' }}
    >
      {showToolbar && (
        <MindMapToolbar
          mode="full"
          onExport={() => setExportModalVisible(true)}
          onImport={() => setImportModalVisible(true)}
          onToggleMinimap={onToggleMinimap}
        />
      )}
      <MindMapGraph
        options={options}
        onChange={onChange}
        onNodeClick={onNodeClick}
        onGraphReady={onGraphReady}
        MindMapNode={MindMapNode}
      />

      {/* 节点编辑器 */}
      <NodeEditor
        visible={nodeEditorVisible}
        nodeId={selectedNodeId}
        onClose={() => setNodeEditorVisible(false)}
      />

      {/* 导出模态框 */}
      <ExportModal visible={exportModalVisible} onClose={() => setExportModalVisible(false)} />

      {/* 导入模态框 */}
      <ImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onImport={handleImport}
      />

      {<MiniMapContainer visible={minimapVisible} />}
    </div>
  );
};

/**
 * 增强型思维导图组件
 * 使用MindMapProvider提供上下文
 */
const MindMap: React.FC<EnhancedMindMapProps> = props => {
  return (
    <MindMapProvider initialData={props.data}>
      <InternalMindMap {...props} />
    </MindMapProvider>
  );
};

export default MindMap;
