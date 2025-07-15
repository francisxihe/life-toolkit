import React, { useEffect } from 'react';
import { marked } from 'marked';
import './index.css';

import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 配置marked选项
const renderer = new marked.Renderer();
marked.use({ renderer });

interface MdPreviewProps {
  mdtext?: string;
}

const MdPreview: React.FC<MdPreviewProps> = ({ mdtext = '' }) => {
  //   const [example, setExample] = useState('initialValue');
  //   useEffect(() => {
  //     // 使用浏览器的 API 更新页面标题
  //     // document.title = `You clicked count times`;
  //   });
  useEffect(() => {
    document.querySelectorAll('pre code').forEach(block => {
      if (block instanceof HTMLElement) {
        hljs.highlightBlock(block);
      }
    });
  }, [mdtext]);

  return (
    <div className="MdPreview">
      <i className="zwicon-note" style={{ fontSize: 20 }}></i>

      <div className="MdPreview-Content" dangerouslySetInnerHTML={{ __html: marked(mdtext) }} />
    </div>
  );
};

export default MdPreview;
