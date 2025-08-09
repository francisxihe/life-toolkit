import { useState, useEffect, useRef } from 'react';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { graphEventEmitter } from '../graph/eventEmitter';
import { Graph } from '@antv/x6';

export default function MiniMapContainer({ visible }: { visible: boolean }) {
  const [graph, setGraph] = useState<Graph | null>(null);
  useEffect(() => {
    const unsubscribe = graphEventEmitter.onEmitGraph(({ graph }) => {
      setGraph(graph);
    });
    return unsubscribe;
  }, []);
  
  const [localMinimapVisible, setLocalMinimapVisible] = useState(visible);
  const minimapRef = useRef<HTMLDivElement>(null);
  const minimapInstanceRef = useRef<MiniMap | null>(null);
  const isInitializedRef = useRef(false);

  // 同步外部传入的minimap可见性
  useEffect(() => {
    console.log('MiniMap visible changed:', visible);
    setLocalMinimapVisible(visible);
  }, [visible]);

  // 初始化minimap插件（只初始化一次）
  useEffect(() => {
    if (!graph || !minimapRef.current || isInitializedRef.current) {
      return;
    }

    try {
      const minimap = new MiniMap({
        container: minimapRef.current,
        width: 150,
        height: 120,
        padding: 10,
        scalable: true,
        minScale: 0.01,
        maxScale: 16,
      });

      graph.use(minimap);
      minimapInstanceRef.current = minimap;
      isInitializedRef.current = true;
      console.log('MiniMap initialized successfully');
    } catch (error) {
      console.error('Error initializing minimap:', error);
    }

    // 清理函数
    return () => {
      // 注意：X6插件一旦添加就不容易移除，所以我们只在组件卸载时清理
      isInitializedRef.current = false;
    };
  }, [graph]);

  // 控制minimap容器的显示隐藏
  useEffect(() => {
    if (minimapRef.current) {
      minimapRef.current.style.display = localMinimapVisible ? 'block' : 'none';
    }
  }, [localMinimapVisible]);

  return (
    <div
      ref={minimapRef}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        display: localMinimapVisible ? 'block' : 'none',
      }}
    />
  );
}
