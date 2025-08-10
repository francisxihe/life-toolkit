import { useState, useEffect, useRef } from 'react';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { graphEventEmitter } from '../graph/eventEmitter';
import { Graph } from '@antv/x6';

export default function MiniMapContainer({ visible }: { visible: boolean }) {
  const [graph, setGraph] = useState<Graph | null>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const minimapInstanceRef = useRef<MiniMap | null>(null);
  const isInitializedRef = useRef(false);

  // 监听graph变化
  useEffect(() => {
    const unsubscribe = graphEventEmitter.onEmitGraph(({ graph }) => {
      setGraph(graph);
    });
    return unsubscribe;
  }, []);

  // 初始化minimap
  useEffect(() => {
    if (!graph || !minimapRef.current || !visible) {
      return;
    }

    // 如果已经初始化过且是同一个graph实例，直接返回
    if (isInitializedRef.current && minimapInstanceRef.current) {
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
  }, [graph, visible]);

  // 当graph变化时重置初始化状态，允许重新初始化
  useEffect(() => {
    isInitializedRef.current = false;
    minimapInstanceRef.current = null;
  }, [graph]);

  // 控制minimap容器的显示隐藏
  useEffect(() => {
    if (minimapRef.current) {
      minimapRef.current.style.display = visible ? 'block' : 'none';
    }
  }, [visible]);

  return (
    <div
      ref={minimapRef}
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '150px',
        height: '120px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        display: visible ? 'block' : 'none',
      }}
    />
  );
}
