import React, { useEffect, useState, useMemo } from 'react';
import { iconLoader } from '../utils/icon-loader';

interface IconProps {
  /** 图标ID */
  name: string;
  /** 图标大小 */
  size?: number;
  /** 自定义类名 */
  className?: string;
  /** 图标颜色 */
  color?: string;
  /** 点击事件 */
  onClick?: () => void;
  /** 是否显示加载状态 */
  showLoading?: boolean;
  /** 加载失败时的回退图标 */
  fallback?: React.ReactNode;
}

/**
 * 图标组件 - 支持动态加载拆分后的SVG图标
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  color = 'currentColor',
  onClick,
  showLoading = true,
  fallback = null
}) => {
  const [iconContent, setIconContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadIcon = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const content = await iconLoader.getIcon(name);
        
        if (mounted) {
          if (content) {
            setIconContent(content);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
          console.error(`加载图标失败: ${name}`, err);
        }
      }
    };

    loadIcon();

    return () => {
      mounted = false;
    };
  }, [name]);

  const svgProps = useMemo(() => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: color,
    className: `icon ${className}`.trim(),
    onClick,
    style: onClick ? { cursor: 'pointer' } : undefined
  }), [size, color, className, onClick]);

  // 加载中状态
  if (loading && showLoading) {
    return (
      <svg {...svgProps}>
        <circle
          cx="12"
          cy="12"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="15 5"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 12 12;360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    );
  }

  // 错误状态
  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <svg {...svgProps}>
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          fill="currentColor"
        />
      </svg>
    );
  }

  // 正常显示图标
  if (iconContent) {
    return (
      <svg
        {...svgProps}
        dangerouslySetInnerHTML={{ __html: iconContent.replace(/<symbol[^>]*>|<\/symbol>/g, '') }}
      />
    );
  }

  return null;
};

/**
 * 图标预加载Hook
 */
export const useIconPreload = (prefixes: string[]) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const preload = async () => {
      try {
        await iconLoader.preloadByPrefixes(prefixes);
        setLoaded(true);
      } catch (err) {
        setError(err as Error);
        console.error('图标预加载失败:', err);
      }
    };

    preload();
  }, [prefixes]);

  return { loaded, error };
};

/**
 * 图标列表Hook
 */
export const useIconList = (prefix?: string) => {
  const [icons, setIcons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        await iconLoader.init();
        const iconList = prefix 
          ? iconLoader.getIconsByPrefix(prefix)
          : iconLoader.getIconList();
        setIcons(iconList);
      } catch (err) {
        console.error('获取图标列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadIcons();
  }, [prefix]);

  return { icons, loading };
};

/**
 * 批量图标组件
 */
interface IconGridProps {
  /** 图标ID列表 */
  icons: string[];
  /** 图标大小 */
  size?: number;
  /** 每行显示的图标数量 */
  columns?: number;
  /** 图标点击事件 */
  onIconClick?: (iconName: string) => void;
  /** 是否显示图标名称 */
  showNames?: boolean;
}

export const IconGrid: React.FC<IconGridProps> = ({
  icons,
  size = 32,
  columns = 8,
  onIconClick,
  showNames = false
}) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '16px',
    padding: '16px'
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    cursor: onIconClick ? 'pointer' : 'default',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={gridStyle}>
      {icons.map(iconName => (
        <div
          key={iconName}
          style={itemStyle}
          onClick={() => onIconClick?.(iconName)}
          onMouseEnter={(e) => {
            if (onIconClick) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icon name={iconName} size={size} />
          {showNames && (
            <span style={{ fontSize: '12px', textAlign: 'center', wordBreak: 'break-all' }}>
              {iconName}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Icon; 