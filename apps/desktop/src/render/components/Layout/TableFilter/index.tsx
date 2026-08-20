import { Divider, Button, Flex } from '@sue/design-web-react';

import { ReactNode } from 'react';

export function TableFilter(props: {
  clearFilters?: () => Promise<void>;
  search?: () => Promise<void>;
  Actions?: ReactNode;
  children: ReactNode;
}) {
  const { clearFilters, search, Actions, children } = props;
  return (
    <Flex container="full" className="w-full my-3">
      <Flex container="fill">{children}</Flex>
      <Divider vertical style={{ height: '80px' }} />
      <Flex container="fixed" className="h-full flex flex-col gap-4 mx-3">
        {Actions || (
          <>
            <Button
              onClick={async () => {
                await clearFilters();
              }}
            >
              重置
            </Button>
            <Button
              type="primary"
              onClick={async () => {
                await search();
              }}
            >
              查询
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
}
