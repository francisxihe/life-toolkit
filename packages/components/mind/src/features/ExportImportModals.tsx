import React, { useState, useRef, useEffect } from 'react';
import { Modal, Radio, Upload, Message } from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import { Graph } from '@antv/x6';
import { useMindMapContext } from '../context';
import { exportToPNG, exportToSVG, exportToJSON, importJSONFromFile } from '../utils/export';
import { graphEventEmitter } from '../graph/eventEmitter';
interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 导出选项组件
 */
const ExportModal: React.FC<ExportModalProps> = ({ visible, onClose }) => {
  const { mindMapData } = useMindMapContext();
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    const unsubscribe = graphEventEmitter.onEmitGraph(({ graph }) => {
      setGraph(graph);
    });
    return unsubscribe;
  }, []);

  const [exportType, setExportType] = useState<'png' | 'svg' | 'json'>('png');
  const [transparent, setTransparent] = useState(false);
  const [fileName, setFileName] = useState('mindmap');

  const handleExport = () => {
    if (!graph) {
      Message.error('无法导出，图形未初始化');
      return;
    }

    switch (exportType) {
      case 'png':
        exportToPNG(graph, fileName, transparent);
        break;
      case 'svg':
        exportToSVG(graph, fileName);
        break;
      case 'json':
        if (mindMapData) {
          const jsonString = exportToJSON(mindMapData);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${fileName}.json`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        } else {
          Message.error('无数据可导出');
        }
        break;
    }

    onClose();
  };

  return (
    <Modal
      title="导出思维导图"
      visible={visible}
      onOk={handleExport}
      onCancel={onClose}
      okText="导出"
      cancelText="取消"
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 font-medium">导出格式</div>
          <Radio.Group type="button" name="exportType" value={exportType} onChange={setExportType}>
            <Radio value="png">PNG 图片</Radio>
            <Radio value="svg">SVG 矢量图</Radio>
            <Radio value="json">JSON 数据</Radio>
          </Radio.Group>
        </div>

        {exportType === 'png' && (
          <div>
            <div className="mb-2 font-medium">背景选项</div>
            <Radio.Group
              type="button"
              name="transparent"
              value={transparent}
              onChange={setTransparent}
            >
              <Radio value={false}>白色背景</Radio>
              <Radio value={true}>透明背景</Radio>
            </Radio.Group>
          </div>
        )}

        <div>
          <div className="mb-2 font-medium">文件名</div>
          <input
            type="text"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="文件名（不含扩展名）"
          />
        </div>
      </div>
    </Modal>
  );
};

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

/**
 * 导入选项组件
 */
const ImportModal: React.FC<ImportModalProps> = ({ visible, onClose, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await importJSONFromFile(file);
      if (data) {
        onImport(data);
        onClose();
      }
    } catch (error) {
      console.error('导入文件失败:', error);
      Message.error('导入失败，请确保文件格式正确');
    }
  };

  return (
    <Modal title="导入思维导图" visible={visible} onCancel={onClose} footer={null}>
      <div className="p-6 text-center">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconUpload className="text-4xl text-gray-400 mb-2" />
          <div className="text-gray-600">
            点击或拖拽文件到此处上传
            <div className="text-xs text-gray-500 mt-1">仅支持 JSON 格式文件</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </Modal>
  );
};

export { ExportModal, ImportModal };
