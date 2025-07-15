/** @jsxImportSource @emotion/react */
import React, { useEffect, useRef, useContext } from 'react';
import { css, cx } from '@emotion/css';
import { context } from '../../context';
import { MindmapNode } from '../../statics/defaultMindmap';
import * as refer from '../../statics/refer';
import Toolbar from './subComponents/Toolbar';
import InputDiv from './subComponents/InputDiv';
import { SET_SELECT, SET_EDIT } from '../../context/reducer/nodeStatus/actionTypes';

interface NodeProps {
  node: MindmapNode;
  parent?: MindmapNode;
  on_left?: boolean;
  node_refs: Set<React.RefObject<HTMLDivElement>>;
}

const Node: React.FC<NodeProps> = ({ node, parent, on_left, node_refs }) => {
  const self = useRef<HTMLDivElement>(null);
  const {
    nodeStatus: { state: nState, dispatch: nDispatch },
  } = useContext(context);

  const handleMouseDown = () => {
    nDispatch({
      type: SET_SELECT,
      data: { cur_select: node.id, select_by_click: true },
    });
  };

  const handleDoubleClick = () => {
    nDispatch({
      type: SET_EDIT,
      data: { cur_edit: node.id },
    });
  };

  const handleMouseEnter = () => {
    // 暂时移除hover状态的处理，因为它不在当前的action types中
  };

  useEffect(() => {
    if (!self.current) return;
    node_refs.add(self);
    return () => {
      node_refs.delete(self);
    };
  }, [node_refs]);

  useEffect(() => {
    if (!parent || !self.current) return;
    self.current.dataset.tag = on_left ? refer.LEFT_NODE : refer.RIGHT_NODE;
  }, [parent, on_left]);

  const style = node.style || {};

  return (
    <div
      ref={self}
      id={node.id}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      style={{
        ...style,
        backgroundColor: style.backgroundColor || '#ffffff',
        borderRadius: style.borderRadius || '5px',
        padding: style.padding || '5px 10px',
        cursor: 'pointer',
        userSelect: 'none',
        border: nState.cur_select === node.id ? '2px solid #1890ff' : 'none',
      }}
    >
      {nState.cur_edit === node.id ? (
        <InputDiv node_id={node.id}>{node.text || ''}</InputDiv>
      ) : (
        <>
          <div>{node.text || ''}</div>
          {nState.cur_select === node.id && parent && (
            <Toolbar node={node} parent={parent} layer={1} />
          )}
        </>
      )}
    </div>
  );
};

export default Node;

// CSS
const style_selected_border = `
box-shadow: 0 0 0 3px #ffffff, 0 0 0 6px var(${refer.THEME_EX}); /* 双层阴影实现选中框 */
`;

const common_style = css`
  position: relative;
  min-width: 10px;
  max-width: 200px;
  margin: 20px 40px;
  padding: 15px;
  background-color: #ffffff;
  border: 1px solid var(${refer.THEME_MAIN});
  border-radius: 15px;
  cursor: pointer;

  p {
    min-height: 18px; /* 当 p 中没有内容时撑起元素 */
    margin: 0;
    line-height: 1.5em;
    overflow-wrap: break-word;
  }

  &:hover {
    ${style_selected_border}
  }

  &.ondrag {
    background-color: var(${refer.THEME_EX});
    p {
      color: #ffffff;
    }
  }
`;

const specific_style = [
  // div&用于提高 CSS 权重
  css`
    div& {
      padding: 15px 20px;
      color: #ffffff;
      font-size: 120%;
      font-weight: 700;
      background-color: var(${refer.THEME_DARK});
      border: 2px solid var(${refer.THEME_EX});
    }
  `,
  css`
    div& {
      background-color: var(${refer.THEME_LIGHT});
    }
  `,
  css`
    div& {
      padding: 10px 15px;
    }
  `,
  css`
    div& {
      padding: 0 15px;
      border: none;
      p {
        font-size: 90%;
      }
    }
  `,
];

const seleted_style = css`
  z-index: 1; /* 提高 Node 高度，防止被遮挡 */
  ${style_selected_border}
`;

// 兼有防止文字被选中的功能
const drop_area = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const toggle_button = css`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  margin: auto 0;
  padding: 0;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 50%;
  outline: none;
`;

const button_left = css`
  left: -15px;
`;

const button_right = css`
  right: -15px;
`;
