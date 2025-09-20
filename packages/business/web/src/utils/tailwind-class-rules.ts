export interface TailwindClassGroup {
  type: string;
  patterns: string[];
}

export const tailwindClassGroups: TailwindClassGroup[] = [
  {
    type: 'layout',
    patterns: [
      'tw-m-',
      'tw-p-',
      'tw-w-',
      'tw-h-',
      'tw-rounded',
      'tw-cursor-',
      'tw-overflow-',
      'tw-position-',
      'tw-top-',
      'tw-left-',
      'tw-right-',
      'tw-bottom-',
    ],
  },
  {
    type: 'flexbox',
    patterns: [
      'tw-flex',
      'tw-grid',
      'tw-items-',
      'tw-justify-',
      'tw-gap-',
      'tw-space-',
      'tw-self-',
    ],
  },
  {
    type: 'typography',
    patterns: [
      'tw-text-',
      'tw-font-',
      'tw-leading-',
      'tw-tracking-',
      'tw-whitespace-',
    ],
  },
  {
    type: 'visual',
    patterns: [
      'tw-bg-',
      'tw-border',
      'tw-shadow',
      'tw-opacity-',
      'tw-z-',
      'tw-transform',
      'tw-transition',
    ],
  },
  {
    type: 'interactive',
    patterns: ['hover:', 'focus:', 'active:', 'disabled:'],
  },
];

export function groupTailwindClasses(classString: string): string[] {
  const classes = classString.split(' ');
  const groupedClasses: { [key: string]: string[] } = {
    layout: [],
    flexbox: [],
    typography: [],
    visual: [],
    interactive: [],
    other: [],
  };

  classes.forEach((cls) => {
    let matched = false;
    for (const group of tailwindClassGroups) {
      if (group.patterns.some((pattern) => cls.startsWith(pattern))) {
        groupedClasses[group.type].push(cls);
        matched = true;
        break;
      }
    }
    if (!matched) {
      groupedClasses.other.push(cls);
    }
  });

  return Object.values(groupedClasses)
    .filter((group) => group.length > 0)
    .map((group) => group.join(' '));
}

// 判断是否需要使用数组形式
export function shouldUseArrayFormat(classString: string): boolean {
  return classString.length > 50 || classString.split(' ').length > 3;
}
