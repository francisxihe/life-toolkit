interface IconIndex {
  totalIcons: number;
  files: Array<{
    name: string;
    file: string;
    icons: number;
    iconIds: string[];
  }>;
}

interface LoadedIcon {
  id: string;
  content: string;
}

class IconLoader {
  private iconIndex: IconIndex | null = null;
  private loadedFiles = new Map<string, LoadedIcon[]>();
  private iconMap = new Map<string, string>(); // iconId -> fileName
  private baseUrl = '/icons/';

  /**
   * 初始化图标加载器
   */
  async init(): Promise<void> {
    if (this.iconIndex) return;

    try {
      const response = await fetch(`${this.baseUrl}index.json`);
      this.iconIndex = await response.json();
      
      // 构建图标ID到文件名的映射
      this.iconIndex.files.forEach(file => {
        file.iconIds.forEach(iconId => {
          this.iconMap.set(iconId, file.name);
        });
      });

      console.log(`📦 图标加载器初始化完成，共 ${this.iconIndex.totalIcons} 个图标`);
    } catch (error) {
      console.error('❌ 图标索引加载失败:', error);
      throw error;
    }
  }

  /**
   * 获取图标列表
   */
  getIconList(): string[] {
    if (!this.iconIndex) {
      throw new Error('图标加载器未初始化，请先调用 init()');
    }
    return Array.from(this.iconMap.keys());
  }

  /**
   * 按前缀获取图标列表
   */
  getIconsByPrefix(prefix: string): string[] {
    return this.getIconList().filter(iconId => iconId.startsWith(prefix));
  }

  /**
   * 获取所有前缀
   */
  getPrefixes(): string[] {
    if (!this.iconIndex) {
      throw new Error('图标加载器未初始化，请先调用 init()');
    }
    return this.iconIndex.files.map(file => file.name);
  }

  /**
   * 加载指定文件的所有图标
   */
  private async loadIconFile(fileName: string): Promise<LoadedIcon[]> {
    if (this.loadedFiles.has(fileName)) {
      return this.loadedFiles.get(fileName)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}${fileName}.svg`);
      const svgContent = await response.text();
      
      // 解析SVG中的symbol元素
      const symbolRegex = /<symbol[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/symbol>/g;
      const icons: LoadedIcon[] = [];
      let match;

      while ((match = symbolRegex.exec(svgContent)) !== null) {
        icons.push({
          id: match[1],
          content: match[0]
        });
      }

      this.loadedFiles.set(fileName, icons);
      console.log(`📥 加载图标文件: ${fileName}.svg (${icons.length} 个图标)`);
      
      return icons;
    } catch (error) {
      console.error(`❌ 加载图标文件失败: ${fileName}.svg`, error);
      throw error;
    }
  }

  /**
   * 获取单个图标
   */
  async getIcon(iconId: string): Promise<string | null> {
    if (!this.iconIndex) {
      await this.init();
    }

    const fileName = this.iconMap.get(iconId);
    if (!fileName) {
      console.warn(`⚠️ 图标不存在: ${iconId}`);
      return null;
    }

    const icons = await this.loadIconFile(fileName);
    const icon = icons.find(icon => icon.id === iconId);
    
    return icon ? icon.content : null;
  }

  /**
   * 批量获取图标
   */
  async getIcons(iconIds: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    
    // 按文件分组图标ID
    const fileGroups = new Map<string, string[]>();
    
    for (const iconId of iconIds) {
      const fileName = this.iconMap.get(iconId);
      if (fileName) {
        if (!fileGroups.has(fileName)) {
          fileGroups.set(fileName, []);
        }
        fileGroups.get(fileName)!.push(iconId);
      }
    }

    // 并行加载所有需要的文件
    const loadPromises = Array.from(fileGroups.keys()).map(fileName => 
      this.loadIconFile(fileName)
    );
    
    await Promise.all(loadPromises);

    // 收集图标内容
    for (const [fileName, iconIdsInFile] of fileGroups) {
      const icons = this.loadedFiles.get(fileName)!;
      for (const iconId of iconIdsInFile) {
        const icon = icons.find(icon => icon.id === iconId);
        if (icon) {
          result.set(iconId, icon.content);
        }
      }
    }

    return result;
  }

  /**
   * 预加载指定前缀的所有图标
   */
  async preloadByPrefix(prefix: string): Promise<void> {
    const fileName = prefix;
    if (this.iconIndex?.files.some(file => file.name === fileName)) {
      await this.loadIconFile(fileName);
    }
  }

  /**
   * 预加载多个前缀的图标
   */
  async preloadByPrefixes(prefixes: string[]): Promise<void> {
    const loadPromises = prefixes.map(prefix => this.preloadByPrefix(prefix));
    await Promise.all(loadPromises);
  }

  /**
   * 创建SVG元素
   */
  async createSVGElement(iconId: string, options: {
    width?: number;
    height?: number;
    className?: string;
    fill?: string;
  } = {}): Promise<SVGElement | null> {
    const iconContent = await this.getIcon(iconId);
    if (!iconContent) return null;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // 设置默认属性
    svg.setAttribute('width', (options.width || 24).toString());
    svg.setAttribute('height', (options.height || 24).toString());
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', options.fill || 'currentColor');
    
    if (options.className) {
      svg.setAttribute('class', options.className);
    }

    // 插入图标内容
    svg.innerHTML = `<use href="#${iconId}"></use>`;
    
    return svg;
  }

  /**
   * 获取统计信息
   */
  getStats(): { totalIcons: number; loadedFiles: number; totalFiles: number } {
    return {
      totalIcons: this.iconIndex?.totalIcons || 0,
      loadedFiles: this.loadedFiles.size,
      totalFiles: this.iconIndex?.files.length || 0
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.loadedFiles.clear();
    console.log('🧹 图标缓存已清理');
  }
}

// 创建全局实例
export const iconLoader = new IconLoader();

// 导出类型
export type { IconIndex, LoadedIcon };

// 便捷函数
export async function loadIcon(iconId: string): Promise<string | null> {
  return iconLoader.getIcon(iconId);
}

export async function loadIcons(iconIds: string[]): Promise<Map<string, string>> {
  return iconLoader.getIcons(iconIds);
}

export async function preloadIcons(prefixes: string[]): Promise<void> {
  return iconLoader.preloadByPrefixes(prefixes);
}

export async function getIconList(): Promise<string[]> {
  await iconLoader.init();
  return iconLoader.getIconList();
}

export async function getIconsByPrefix(prefix: string): Promise<string[]> {
  await iconLoader.init();
  return iconLoader.getIconsByPrefix(prefix);
} 