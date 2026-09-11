import { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Flex, Layout, Spin } from '@sue/design-web-react';
import cs from 'clsx';
import { useSelector } from 'react-redux';
import { useWorkbenchOptional } from '@true-north/plugin-sdk';
import { RouterContext } from '@/router/useRouter';
import { GlobalState } from '@/store';
import { AppAside } from './AppAside';
import { WorkbenchPanel } from '@/features/workbench';
import styles from './Layout.module.less';

const Aside = Layout.Sider;

export const ASIDE_WIDTH_KEY = 'app-aside-width';
export const DEFAULT_ASIDE_WIDTH = 280;
export const MIN_ASIDE_WIDTH = 240;
export const MAX_ASIDE_WIDTH = 420;
const MIN_CONVERSATION_WIDTH = 360;

function isAiPath(pathname: string) {
  return pathname === '/ai' || pathname.startsWith('/ai/');
}

function readAsideWidth() {
  if (typeof window === 'undefined') return DEFAULT_ASIDE_WIDTH;
  const parsed = Number(window.localStorage.getItem(ASIDE_WIDTH_KEY));
  if (!Number.isFinite(parsed)) return DEFAULT_ASIDE_WIDTH;
  return Math.min(MAX_ASIDE_WIDTH, Math.max(MIN_ASIDE_WIDTH, Math.round(parsed)));
}

function PageLayout() {
  useContext(RouterContext);
  const location = useLocation();
  const { userLoading } = useSelector((state: GlobalState) => state);
  const workbench = useWorkbenchOptional();
  const [asideWidth, setAsideWidth] = useState(readAsideWidth);
  const [dragging, setDragging] = useState(false);

  const setLeftReserve = workbench?.setLeftReserve;

  useEffect(() => {
    setLeftReserve?.(asideWidth);
  }, [asideWidth, setLeftReserve]);

  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (event: MouseEvent) => {
      const reserved = (workbench?.open ? workbench.width : 0) + MIN_CONVERSATION_WIDTH;
      const maxWidth = Math.min(MAX_ASIDE_WIDTH, Math.max(MIN_ASIDE_WIDTH, window.innerWidth - reserved));
      const next = Math.min(maxWidth, Math.max(MIN_ASIDE_WIDTH, Math.round(event.clientX)));
      setAsideWidth(next);
      window.localStorage.setItem(ASIDE_WIDTH_KEY, String(next));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.classList.add(styles.resizing);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.classList.remove(styles.resizing);
    };
  }, [dragging, workbench?.open, workbench?.width]);

  return (
    <Flex container="full">
      {userLoading ? (
        <Spin className={styles.spin} />
      ) : (
        <>
          <Flex container="fixed" className={`${styles['layout-sider-wrap']} h-full`} style={{ width: asideWidth }}>
            <Aside theme="light" className={styles['layout-sider']} width={asideWidth} trigger={null}>
              <AppAside />
            </Aside>
            <button
              type="button"
              className={`${styles.resizeHandle} ${dragging ? styles.resizeHandleActive : ''}`}
              aria-label="调整侧栏宽度"
              onMouseDown={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
            />
          </Flex>
          <Flex
            container="fill"
            vertical
            className={cs(styles['layout-content'], isAiPath(location.pathname) && styles['layout-content-bleed'])}
          >
            <Flex container="fill" className="overflow-y-auto">
              <Outlet />
            </Flex>
          </Flex>
          <WorkbenchPanel />
        </>
      )}
    </Flex>
  );
}

export default PageLayout;
