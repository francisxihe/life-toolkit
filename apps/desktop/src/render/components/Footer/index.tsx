import { Flex, Layout } from '@sue/design-web-react';
import type { HTMLAttributes } from 'react';

import cs from 'clsx';

function Footer(props: HTMLAttributes<HTMLElement> = {}) {
  const { className, ...restProps } = props;
  return (
    <Flex
      component={Layout.Footer}
      align="center"
      justify="center"
      className={cs('h-10 text-text-2', className)}
      {...restProps}
    >
      True North
    </Flex>
  );
}

export default Footer;
