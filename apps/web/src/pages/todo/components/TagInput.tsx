'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@arco-design/web-react';
import { Badge } from '@arco-design/web-react';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  if (!value) value = [];
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<RefInputType>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div
      className="flex flex-wrap gap-2 p-2 border rounded-md bg-bg-1"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, index) => (
        <Badge key={index} className="flex items-center gap-1">
          {tag}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => removeTag(index)}
          />
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
}
