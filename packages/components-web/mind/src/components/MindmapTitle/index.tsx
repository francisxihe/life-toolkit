import { useEffect, useContext, useRef, KeyboardEvent } from 'react';
import { css } from '@emotion/css';
import { context } from '../../context';
import { setTitle } from '../../context/reducer/global/actionCreator';
import * as refer from '../../statics/refer';

const MindmapTitle = () => {
  const self = useRef<HTMLSpanElement>(null);
  const {
    global: {
      state: { title },
      dispatch,
    },
  } = useContext(context);

  useEffect(() => {
    document.title = `RMind - ${title}`;
    localStorage.setItem('title', title);
  }, [title]);

  const handleKeydown = (event: KeyboardEvent<HTMLSpanElement>) => {
    switch (event.key.toUpperCase()) {
      case 'ESCAPE':
        if (self.current) {
          self.current.textContent = title;
        }
        break;
      case 'ENTER':
        if (self.current) {
          self.current.blur();
        }
        break;
      default:
        break;
    }
  };

  const handleBlur = () => {
    if (!self.current) return;
    let new_title = self.current.textContent?.trim() || '';
    if (new_title === '') {
      new_title = title;
    }
    if (new_title.length > 30) {
      new_title = new_title.slice(0, 30);
    }
    if (self.current) {
      self.current.textContent = new_title; // contentEditable 组件内容不会被自动更新
    }
    dispatch(setTitle(new_title));
  };

  return (
    <span
      ref={self}
      className={wrapper}
      contentEditable="true"
      suppressContentEditableWarning={true}
      spellCheck="false"
      onKeyDown={handleKeydown}
      onBlur={handleBlur}
    >
      {title}
    </span>
  );
};

export default MindmapTitle;

// CSS
const wrapper = css`
  align-self: center;
  padding: 0 10px; /* 两侧 padding 用于增大组件点击区域，避免将光标定位至首尾处时意外 blur */
  color: var(${refer.THEME_DARK});
  font-size: 20px;
  font-weight: 700;
  border-bottom: 2px solid transparent;
  outline: none;
  transition: 0.2s;

  &:read-write {
    cursor: edit;
  }

  &:focus {
    border-bottom: 2px solid var(${refer.THEME_ASSIST});
  }
`;
