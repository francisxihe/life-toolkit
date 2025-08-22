'use client';

import { Select } from '@arco-design/web-react';

const options = [
  {
    label: 'Tag 1',
    value: 'tag1',
  },
];

export type TagProps =
  | {
      multiple: true;
      value: string[];
      onChange: (value: string[]) => void;
    }
  | {
      multiple: false;
      value: string;
      onChange: (value: string) => void;
    };

export function TagEditor({ value, multiple = true, onChange }: TagProps) {
  return (
    <Select
      mode={multiple ? 'multiple' : undefined}
      maxTagCount={multiple ? 'responsive' : undefined}
      placeholder={'添加标签'}
      defaultValue={value}
      onChange={(e) => onChange(e)}
      options={options}
      allowClear
      allowCreate
    ></Select>
  );
}

export function TagSelector({ value, multiple = true, onChange }: TagProps) {
  return (
    <Select
      mode={multiple ? 'multiple' : undefined}
      maxTagCount={multiple ? 'responsive' : undefined}
      placeholder={'选择标签'}
      defaultValue={value}
      onChange={(e) => onChange(e)}
      options={options}
      allowClear
    ></Select>
  );
}
