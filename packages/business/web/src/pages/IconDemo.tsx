import React, { useState, useEffect } from 'react';
import {
  Icon,
  IconGrid,
  useIconList,
  useIconPreload,
} from '../components/Icon';
import { iconLoader } from '../utils/icon-loader';

const IconDemo: React.FC = () => {
  const [selectedPrefix, setSelectedPrefix] = useState<string>('');
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalIcons: 0,
    loadedFiles: 0,
    totalFiles: 0,
  });

  // 获取图标列表
  const { icons, loading } = useIconList(selectedPrefix);

  // 预加载常用图标
  const { loaded: preloaded } = useIconPreload([
    'ac',
    'add',
    'calendar',
    'edit',
  ]);

  // 获取前缀列表
  useEffect(() => {
    const loadPrefixes = async () => {
      await iconLoader.init();
      const prefixList = iconLoader.getPrefixes();
      setPrefixes(prefixList);
      setStats(iconLoader.getStats());
    };
    loadPrefixes();
  }, []);

  // 更新统计信息
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(iconLoader.getStats());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 过滤图标
  const filteredIcons = icons.filter((icon) =>
    icon.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePrefixChange = (prefix: string) => {
    setSelectedPrefix(prefix);
    setSearchTerm('');
  };

  const handleIconClick = (iconName: string) => {
    navigator.clipboard.writeText(`<Icon name="${iconName}" />`);
    alert(`已复制到剪贴板: <Icon name="${iconName}" />`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>图标库演示</h1>

      {/* 统计信息 */}
      <div
        style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div>
          <strong>总图标数:</strong> {stats.totalIcons}
        </div>
        <div>
          <strong>已加载文件:</strong> {stats.loadedFiles} / {stats.totalFiles}
        </div>
        <div>
          <strong>预加载状态:</strong> {preloaded ? '✅ 完成' : '⏳ 加载中'}
        </div>
      </div>

      {/* 示例图标 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>示例图标</h2>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="ac-add-file" size={24} />
            <span>ac-add-file</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="calendar" size={24} color="#007bff" />
            <span>calendar (蓝色)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="edit" size={32} />
            <span>edit (32px)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon
              name="ac-delete"
              size={24}
              color="#dc3545"
              onClick={() => alert('删除图标被点击')}
            />
            <span>ac-delete (可点击)</span>
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 200px',
          gap: '16px',
          marginBottom: '20px',
          alignItems: 'end',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            选择前缀分类:
          </label>
          <select
            value={selectedPrefix}
            onChange={(e) => handlePrefixChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            <option value="">所有图标</option>
            {prefixes.map((prefix) => (
              <option key={prefix} value={prefix}>
                {prefix} ({iconLoader.getIconsByPrefix(prefix).length} 个)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            搜索图标:
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="输入图标名称..."
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>

        <button
          onClick={() => iconLoader.clearCache()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          清理缓存
        </button>
      </div>

      {/* 图标网格 */}
      <div>
        <h2>
          图标列表
          {selectedPrefix && ` - ${selectedPrefix}`}
          {searchTerm && ` (搜索: "${searchTerm}")`}
          <span style={{ color: '#666', fontWeight: 'normal' }}>
            ({filteredIcons.length} 个图标)
          </span>
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Icon name="loading" size={32} />
            <p>加载中...</p>
          </div>
        ) : filteredIcons.length > 0 ? (
          <IconGrid
            icons={filteredIcons}
            size={32}
            columns={10}
            onIconClick={handleIconClick}
            showNames={true}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {searchTerm ? `没有找到包含 "${searchTerm}" 的图标` : '没有图标'}
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        <h3>使用说明</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}
        >
          <div>
            <h4>基本用法:</h4>
            <pre
              style={{
                background: '#fff',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              {`import { Icon } from './components/Icon';

// 基本使用
<Icon name="ac-add-file" />

// 自定义大小和颜色
<Icon name="calendar" size={32} color="#007bff" />

// 添加点击事件
<Icon 
  name="ac-delete" 
  onClick={() => handleDelete()} 
/>`}
            </pre>
          </div>
          <div>
            <h4>预加载图标:</h4>
            <pre
              style={{
                background: '#fff',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              {`import { useIconPreload } from './components/Icon';

// 预加载常用图标
const { loaded } = useIconPreload(['ac', 'calendar', 'edit']);

// 批量加载图标
import { preloadIcons } from './utils/icon-loader';
await preloadIcons(['add', 'delete', 'edit']);`}
            </pre>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <h4>性能优化建议:</h4>
          <ul>
            <li>
              使用 <code>useIconPreload</code> 预加载页面常用的图标前缀
            </li>
            <li>图标按前缀自动分组，只有使用时才会加载对应的文件</li>
            <li>相同前缀的图标会被缓存，避免重复加载</li>
            <li>点击图标可复制对应的 React 代码到剪贴板</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IconDemo;
