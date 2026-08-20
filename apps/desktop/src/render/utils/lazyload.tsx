import React from 'react';
import loadable from '@loadable/component';
import { Flex, Spin } from '@sue/design-web-react';

// https://github.com/gregberge/loadable-components/pull/226
function load(fn, options) {
  const Component = loadable(fn, options);

  Component.preload = fn.requireAsync || fn;

  return Component;
}

function LoadingComponent(props: {
  error: boolean;
  timedOut: boolean;
  pastDelay: boolean;
}) {
  if (props.error) {
    console.error(props.error);
    return null;
  }
  return (
    <Flex className="spin" align="center" justify="center">
      <Spin />
    </Flex>
  );
}

export default (loader) =>
  load(loader, {
    fallback: (
      <LoadingComponent pastDelay={true} error={false} timedOut={false} />
    ),
  });
