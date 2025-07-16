import React, { useState, useEffect, ChangeEvent } from 'react';

interface MdEditorProps {
  propText: string;
  className?: string;
  onBlur?: (text: string) => void;
}

const MdEditor: React.FC<MdEditorProps> = props => {
  const { propText, onBlur } = props;

  const [text, setText] = useState<string>(propText);

  useEffect(() => {
    setText(propText);
  }, [propText]);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    console.log('备注：', text);
    onBlur?.(text);
  };

  return (
    <div className={props.className || ''}>
      <textarea
        style={{
          width: '100%',
          height: '100%',
          resize: 'none' as const,
        }}
        onChange={onChange}
        onBlur={handleBlur}
        value={text}
      />
    </div>
  );
};

export default MdEditor;
