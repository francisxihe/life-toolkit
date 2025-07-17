import { useState } from 'react';
import { css } from '@emotion/css';
import { 
  useMindmapActions, 
  useHistoryActions, 
  useGlobalActions 
} from '../../context';
import * as refer from '../../statics/refer';
import * as popupType from '../../components/Popup/common/popupType';
import { handlePropagation, download } from '../../methods/assistFunctions'; // 防止 Mindmap 中的选中状态由于冒泡被清除
import ToolButton from '../../components/ToolButton';
import MindmapTitle from '../../components/MindmapTitle';
import Popup from '../../components/Popup';

const Nav = () => {
  const [popup, setPopup] = useState(popupType.NONE);
  const { mindmap, expandAll } = useMindmapActions();
  const { history, undo: undoHistory, canUndo, canRedo } = useHistoryActions();
  const { globalState, zoomIn, zoomOut, resetZoom, resetPosition } = useGlobalActions();
  const title = globalState.title;

  const handleClosePopup = () => {
    setPopup(popupType.NONE);
  };

  const handleNewFile = () => {
    setPopup(popupType.NEW);
  };

  const handleDownload = () => {
    const url = `data:text/plain,${encodeURIComponent(JSON.stringify(mindmap))}`;
    download(url, `${title}.rmf`);
  };

  const handleOpenFile = () => {
    setPopup(popupType.OPEN);
  };

  const handleExport = () => {
    setPopup(popupType.EXPORT);
  };

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    switch (type) {
      case 'in':
        zoomIn();
        break;
      case 'out':
        zoomOut();
        break;
      case 'reset':
        zoomReset();
        break;
    }
  };

  const handleMove = (type: 'reset') => {
    switch (type) {
      case 'reset':
        resetPosition();
        break;
    }
  };

  const handleUndo = () => {
    undoHistory();
  };

  const handleRedo = () => {
    // 目前新的 hooks 系统中没有实现 redo 功能
    console.log('Redo functionality not implemented yet');
  };

  const handleExpandAll = () => {
    expandAll(refer.ROOT_NODE_ID);
  };

  const handleTheme = () => {
    setPopup(popupType.THEME);
  };

  const handleSettings = () => {
    // setPopup(popupType.SETTINGS);
    console.log('Settings clicked');
  };

  const handleHelp = () => {
    // setPopup(popupType.HELP);
    console.log('Help clicked');
  };

  const handleAbout = () => {
    // setPopup(popupType.ABOUT);
    console.log('About clicked');
  };

  return (
    <div
      className={css`
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background-color: var(--theme-light);
        border-bottom: 1px solid var(--theme-main);
        display: flex;
        align-items: center;
        padding: 0 20px;
        z-index: 1000;
        gap: 10px;
      `}
      onClick={handlePropagation}
    >
      <MindmapTitle />
      
      <div className={css`display: flex; gap: 5px;`}>
        <ToolButton icon={'file-plus'} onClick={handleNewFile}>
          新建
        </ToolButton>
        <ToolButton icon={'folder-open'} onClick={handleOpenFile}>
          打开
        </ToolButton>
        <ToolButton icon={'download'} onClick={handleDownload}>
          下载
        </ToolButton>
        <ToolButton icon={'export'} onClick={handleExport}>
          导出
        </ToolButton>
      </div>

      <div className={css`display: flex; gap: 5px;`}>
        <ToolButton icon={'zoom-in'} onClick={() => handleZoom('in')}>
          放大
        </ToolButton>
        <ToolButton icon={'zoom-out'} onClick={() => handleZoom('out')}>
          缩小
        </ToolButton>
        <ToolButton icon={'rotate-left'} onClick={() => handleZoom('reset')}>
          重置缩放
        </ToolButton>
      </div>

      <div className={css`display: flex; gap: 5px;`}>
        <ToolButton icon={'rotate-left'} onClick={() => handleMove('reset')}>
          重置位置
        </ToolButton>
      </div>

      <div className={css`display: flex; gap: 5px;`}>
        <ToolButton icon={'expand-all'} onClick={handleExpandAll}>
          展开全部
        </ToolButton>
      </div>

      <div className={css`display: flex; gap: 5px;`}>
        <ToolButton icon={'undo'} disabled={history.past.length === 0} onClick={handleUndo}>
          撤销
        </ToolButton>
        <ToolButton icon={'redo'} disabled={history.future.length === 0} onClick={handleRedo}>
          重做
        </ToolButton>
      </div>

      <div className={css`display: flex; gap: 5px; margin-left: auto;`}>
        <ToolButton icon={'theme'} onClick={handleTheme}>
          主题
        </ToolButton>
        <ToolButton icon={'settings'} onClick={handleSettings}>
          设置
        </ToolButton>
        <ToolButton icon={'help'} onClick={handleHelp}>
          帮助
        </ToolButton>
        <ToolButton icon={'info'} onClick={handleAbout}>
          关于
        </ToolButton>
      </div>

      <Popup type={popup} handleClosePopup={handleClosePopup} handleDownload={handleDownload} />
    </div>
  );
};

export default Nav;
