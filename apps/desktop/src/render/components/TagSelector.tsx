'use client';

import { Select } from '@sue/design-web-react';

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

export function TagEditor(props: TagProps) {
  const { value } = props;
  const multiple = props.multiple !== false;

  return (
    <Select
      mode={multiple ? 'tags' : undefined}
      maxTagCount={multiple ? 'responsive' : undefined}
      placeholder={'添加标签'}
      defaultValue={value}
      onChange={(next) => {
        if (props.multiple !== false) {
          props.onChange(next as string[]);
        } else {
          props.onChange(next as string);
        }
      }}
      options={options}
      allowClear
    ></Select>
  );
}

export function TagSelector(props: TagProps) {
  const { value } = props;
  const multiple = props.multiple !== false;

  return (
    <Select
      mode={multiple ? 'multiple' : undefined}
      maxTagCount={multiple ? 'responsive' : undefined}
      placeholder={'选择标签'}
      defaultValue={value}
      onChange={(next) => {
        if (props.multiple !== false) {
          props.onChange(next as string[]);
        } else {
          props.onChange(next as string);
        }
      }}
      options={options}
      allowClear
    ></Select>
  );
}
