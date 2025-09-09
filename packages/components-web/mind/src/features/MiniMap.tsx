import { useState, useEffect, useRef } from 'react';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { graphEventEmitter } from '../graph/eventEmitter';
import { Graph } from '@antv/x6';
import { useMindMapContext } from '../context';

export default function MiniMapContainer() {
  const { minimapVisible } = useMindMapContext();
  const [graph, setGraph] = useState<Graph | null>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const minimapInstanceRef = useRef<MiniMap | null>(null);
  const isInitializedRef = useRef(false);

  // 监听graph变化
  useEffect(() => {
    console.log('graphEventEmitter.onEmitGraph', graphEventEmitter);
    const unsubscribe = graphEventEmitter.onEmitGraph(({ graph }) => {
      console.log('graph', graph);
      setGraph(graph);
    });
    return unsubscribe;
  }, []);

  // 清理之前的minimap实例
  const cleanupMinimap = () => {
    if (minimapInstanceRef.current) {
      try {
        minimapInstanceRef.current = null;
      } catch (error) {
        console.error('Error cleaning up minimap:', error);
      }
    }
    isInitializedRef.current = false;
  };

  // 初始化minimap
  useEffect(() => {
    console.log('minimapRef.current', graph);
    if (!graph || !minimapRef.current) {
      return;
    }

    // 处理minimap显示状态变化
    if (!minimapVisible) {
      if (minimapRef.current) {
        minimapRef.current.style.display = 'none';
      }
      return;
    } else if (minimapRef.current) {
      minimapRef.current.style.display = 'block';
    }

    // 如果已经初始化过且是同一个graph实例，直接返回
    if (isInitializedRef.current && minimapInstanceRef.current) {
      return;
    }

    // 清理之前的实例
    cleanupMinimap();

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
  }, [graph, minimapVisible]);

  // 当组件卸载时清理minimap
  useEffect(() => {
    return () => {
      cleanupMinimap();
    };
  }, []);

  // 当graph变化时重置初始化状态，允许重新初始化
  useEffect(() => {
    cleanupMinimap();
  }, [graph]);

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
        visibility: minimapVisible ? 'visible' : 'hidden', // 使用visibility而不是display
      }}
    />
  );
}
