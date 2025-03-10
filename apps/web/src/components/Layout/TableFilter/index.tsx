import { Divider, Grid, Button } from '@arco-design/web-react';
import FlexibleContainer from '../FlexibleContainer';
import { ReactNode } from 'react';

const { Fixed, Shrink } = FlexibleContainer;
const { Row, Col } = Grid;

export function TableFilter(props: {
  clearFilters?: () => Promise<void>;
  search?: () => Promise<void>;
  Actions?: ReactNode;
  children: ReactNode;
}) {
  const { clearFilters, search, Actions, children } = props;
  return (
    <FlexibleContainer className="w-full my-3" direction="vertical">
      <Shrink>{children}</Shrink>
      <Divider type="vertical" style={{ height: '80px' }} />
      <Fixed className="flex flex-col gap-4 mx-3">
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
      </Fixed>
    </FlexibleContainer>
  );
}
