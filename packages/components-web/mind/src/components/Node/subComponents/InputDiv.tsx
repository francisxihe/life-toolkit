import React, { useEffect, useRef, KeyboardEvent } from 'react';
import { css } from '@emotion/css';
import useMindmap from '../../../customHooks/useMindmap';
import { handlePropagation } from '../../../methods/assistFunctions';

interface InputDivProps {
  node_id: string;
  children: string;
}

const InputDiv: React.FC<InputDivProps> = ({ node_id, children }) => {
  const self = useRef<HTMLDivElement>(null);
  const { changeText, selectNode } = useMindmap();

  const handleKeydown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key.toUpperCase()) {
      case 'ESCAPE':
        if (self.current) {
          self.current.textContent = children;
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
    if (self.current) {
      changeText(node_id, self.current.textContent || '');
      selectNode(node_id);
    }
  };

  useEffect(() => {
    if (self.current) {
      self.current.focus();
      const selection = document.getSelection();
      if (selection) {
        selection.selectAllChildren(self.current);
      }
    }
  }, []);

  return (
    <div
      className={wrapper}
      ref={self}
      contentEditable="true"
      suppressContentEditableWarning={true}
      onClick={handlePropagation}
      onKeyDown={handleKeydown}
      onBlur={handleBlur}
    >
      {children}
    </div>
  );
};

export default InputDiv;

// CSS
const wrapper = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: fit-content;
  min-width: 1em;
  max-width: 10em;
  height: fit-content;
  margin: auto;
  padding: 10px;
  color: #333333;
  background-color: #ffffff;
  box-shadow: 0 0 20px #aaaaaa;
  border-radius: 5px;
  outline: none;
  z-index: 3;
  user-select: text;
`;
