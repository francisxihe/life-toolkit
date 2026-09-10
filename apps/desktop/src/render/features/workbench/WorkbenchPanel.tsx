import { useEffect, useRef, useState } from 'react';
import { Flex, Input } from '@sue/design-web-react';
import { ChevronLeft, ChevronRight, Compass, Download, Loader2, Plus, RefreshCw, X } from 'lucide-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import type { ProductSurfaceHostProps } from '@ylib/product-surface-react';
import { useWorkbench } from './context';
import { ToolStage } from './ToolStage';
import styles from './style.module.less';

const EMPTY_BOUNDS = { x: 0, y: 0, width: 0, height: 0 };

function TabBar({ 'data-product-ref': productRefAttr }: ProductSurfaceHostProps) {
  const { tabs, activeTabId, createTab, closeTab, activateTab, close } = useWorkbench();

  return (
    <Flex className={`${styles.tabBar} w-full`} align="center" gap={4} data-product-ref={productRefAttr}>
      <Flex className={styles.tabScroller} container="fill" align="center" gap={2}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tab.id === activeTabId ? styles.tabActive : ''}`}
            onClick={() => void activateTab(tab.id)}
          >
            <span className={styles.tabTitle}>{tab.title}</span>
            <span
              className={styles.tabClose}
              role="button"
              tabIndex={0}
              aria-label="关闭标签"
              onClick={(event) => {
                event.stopPropagation();
                void closeTab(tab.id);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation();
                  event.preventDefault();
                  void closeTab(tab.id);
                }
              }}
            >
              <X size={16} />
            </span>
          </button>
        ))}
      </Flex>
      <button type="button" className={styles.iconBtn} aria-label="新标签页" onClick={() => void createTab()}>
        <Plus size={16} />
      </button>
      <button type="button" className={styles.iconBtn} aria-label="关闭工作台" onClick={close}>
        <X size={16} />
      </button>
    </Flex>
  );
}

function AddressBar({ 'data-product-ref': productRefAttr }: ProductSurfaceHostProps) {
  const { activeWebTab, addressInputRef, navigate, goBack, goForward, reload } = useWorkbench();
  const [draft, setDraft] = useState(activeWebTab?.url ?? '');
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) setDraft(activeWebTab?.url ?? '');
  }, [activeWebTab?.id, activeWebTab?.url]);

  return (
    <Flex className={`${styles.addressBar} w-full`} align="center" gap={6} data-product-ref={productRefAttr}>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label="后退"
        disabled={!activeWebTab?.canGoBack}
        onClick={() => void goBack()}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label="前进"
        disabled={!activeWebTab?.canGoForward}
        onClick={() => void goForward()}
      >
        <ChevronRight size={16} />
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label="刷新"
        disabled={!activeWebTab?.url}
        onClick={() => void reload()}
      >
        {activeWebTab?.loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
      </button>
      <Input
        ref={addressInputRef as never}
        className={styles.addressInput}
        value={draft}
        placeholder="输入 URL"
        allowClear
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
          setDraft(activeWebTab?.url ?? '');
        }}
        onChange={(event) => setDraft(event.target.value)}
        onPressEnter={() => void navigate(draft)}
      />
      <ProductSurface id={productRef('workbench.view.capture')}>
        <ExtractButton />
      </ProductSurface>
    </Flex>
  );
}

function ExtractButton({ 'data-product-ref': productRefAttr }: ProductSurfaceHostProps) {
  const { activeWebTab, extractActiveTab } = useWorkbench();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className={styles.iconBtn}
      aria-label="拉取当前页"
      disabled={!activeWebTab?.url || busy}
      data-product-ref={productRefAttr}
      onClick={() => {
        if (busy) return;
        setBusy(true);
        void extractActiveTab().finally(() => setBusy(false));
      }}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
    </button>
  );
}

function Stage({ 'data-product-ref': productRefAttr }: ProductSurfaceHostProps) {
  const { activeWebTab } = useWorkbench();
  if (activeWebTab?.url) return <div className={styles.stageFill} data-product-ref={productRefAttr} />;

  return (
    <Flex
      vertical
      container="full"
      align="center"
      justify="center"
      className={styles.empty}
      data-product-ref={productRefAttr}
    >
      <Compass size={64} className={styles.emptyIcon} />
      <p className={styles.emptyTitle}>开始浏览</p>
      <p className={styles.emptyHint}>输入 URL 以打开页面</p>
    </Flex>
  );
}

export function WorkbenchPanel() {
  const { open, width, setWidth, reportBounds, activeTab } = useWorkbench();
  const [dragging, setDragging] = useState(false);
  const holeRef = useRef<HTMLDivElement>(null);
  const showingWeb = activeTab?.kind !== 'tool';

  useEffect(() => {
    if (!open) return undefined;
    if (!showingWeb) {
      reportBounds(EMPTY_BOUNDS);
      return undefined;
    }
    const node = holeRef.current;
    if (!node) return undefined;

    const publish = () => {
      const rect = node.getBoundingClientRect();
      reportBounds({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    window.addEventListener('resize', publish);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', publish);
      reportBounds(EMPTY_BOUNDS);
    };
  }, [open, reportBounds, showingWeb]);

  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (event: globalThis.MouseEvent) => {
      setWidth(window.innerWidth - event.clientX);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, setWidth]);

  if (!open) return null;

  return (
    <div className="h-full" style={{ width }}>
    <ProductSurface id={productRef('workbench.view.shell')}>
      <Flex vertical container="fixed" className={`${styles.shell} h-full`}>
        <button
          type="button"
          className={`${styles.resizeHandle} ${dragging ? styles.resizeHandleActive : ''}`}
          aria-label="调整工作台宽度"
          onMouseDown={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
        />
        <ProductSurface id={productRef('workbench.view.tab-bar')}>
          <TabBar />
        </ProductSurface>
        {showingWeb ? (
          <ProductSurface id={productRef('workbench.view.address-bar')}>
            <AddressBar />
          </ProductSurface>
        ) : null}
        <div ref={holeRef} className={styles.stageWrap}>
          {activeTab?.kind === 'tool' ? (
            <ProductSurface id={productRef('workbench.view.tool-stage')}>
              <ToolStage tab={activeTab} />
            </ProductSurface>
          ) : (
            <ProductSurface id={productRef('workbench.view.stage')}>
              <Stage />
            </ProductSurface>
          )}
        </div>
      </Flex>
    </ProductSurface>
    </div>
  );
}
