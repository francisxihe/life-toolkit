import React, { useEffect, useState } from 'react';
import electronBridge from '../../utils/electronBridge';

interface AppInfo {
  version: string;
  platform: string;
}

interface FileOperationResult {
  success: boolean;
  message: string;
}

/**
 * Electron功能演示组件
 * 用于展示在web应用中如何使用Electron API
 */
const ElectronDemo: React.FC = () => {
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [fileResult, setFileResult] = useState<FileOperationResult | null>(
    null,
  );
  const [filePath, setFilePath] = useState<string>('/tmp/test.txt');
  const [notification, setNotification] = useState<string>('');

  // 检查是否在Electron环境中
  useEffect(() => {
    const checkElectron = async () => {
      const isInElectron = electronBridge.isElectronEnv();
      setIsElectron(isInElectron);

      if (isInElectron) {
        // 获取应用信息
        const info = await electronBridge.getAppInfo();
        setAppInfo(info);

        // 设置通知监听
        electronBridge.listenToEvent('notification', (data) => {
          setNotification(`收到通知: ${data.message}`);
        });
      }
    };

    checkElectron();

    // 组件卸载时移除事件监听
    return () => {
      electronBridge.removeEventListener('notification');
    };
  }, []);

  // 处理文件操作
  const handleFileOperation = async () => {
    if (!filePath.trim()) {
      alert('请输入文件路径');
      return;
    }

    const result = await electronBridge.readFile(filePath);
    setFileResult(result);
  };

  return (
    <div className="electron-demo p-6 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Electron功能演示</h2>

      <div className="mb-4">
        <p className="mb-2">
          <strong>环境检测:</strong>
          {isElectron ? (
            <span className="text-green-600">在Electron环境中运行</span>
          ) : (
            <span className="text-blue-600">在Web浏览器中运行</span>
          )}
        </p>
      </div>

      {appInfo && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">应用信息:</h3>
          <p>版本: {appInfo.version}</p>
          <p>平台: {appInfo.platform}</p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold mb-2">文件操作:</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="输入文件路径"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleFileOperation}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!isElectron}
          >
            读取文件
          </button>
        </div>

        {fileResult && (
          <div
            className={`p-3 rounded ${fileResult.success ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <p>{fileResult.message}</p>
          </div>
        )}
      </div>

      {notification && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">通知:</h3>
          <div className="p-3 bg-yellow-100 rounded">{notification}</div>
        </div>
      )}

      {!isElectron && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-gray-700">
            注意: 要启用完整功能，请在Electron应用中运行此页面。
          </p>
        </div>
      )}
    </div>
  );
};

export default ElectronDemo;
