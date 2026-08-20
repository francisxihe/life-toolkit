import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  Children,
  isValidElement,
  type ReactNode,
} from 'react';
import { ArrowDownOutlined, Button, Flex } from '@sue/design-web-react';
import styles from '../style.module.less';

const NEAR_BOTTOM_PX = 56;

type ViewportApi = {
  stuck: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
};

const ConversationViewportContext = createContext<ViewportApi | null>(null);

function isNearBottom(el: HTMLElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
}

export function useConversationViewport(options: {
  resetKey?: string | null;
  followOnSend?: boolean;
}) {
  const { resetKey, followOnSend } = options;
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const stuckRef = useRef(true);
  const programmaticRef = useRef(false);
  const prevFollowRef = useRef(followOnSend);
  const [stuck, setStuck] = useState(true);

  const applyStuck = useCallback((value: boolean) => {
    stuckRef.current = value;
    setStuck(value);
  }, []);

  const markProgrammatic = useCallback(() => {
    programmaticRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        programmaticRef.current = false;
      });
    });
  }, []);

  const forceToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const el = viewportRef.current;
      if (!el) return;
      applyStuck(true);
      markProgrammatic();
      if (behavior === 'smooth') {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    },
    [applyStuck, markProgrammatic]
  );

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      forceToBottom(behavior);
    },
    [forceToBottom]
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => {
      if (programmaticRef.current) return;
      applyStuck(isNearBottom(el));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [applyStuck]);

  useEffect(() => {
    const el = viewportRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const observer = new ResizeObserver(() => {
      if (!stuckRef.current) return;
      markProgrammatic();
      el.scrollTop = el.scrollHeight;
    });
    observer.observe(inner);
    return () => observer.disconnect();
  }, [markProgrammatic]);

  useEffect(() => {
    applyStuck(true);
    const el = viewportRef.current;
    if (!el) return;
    markProgrammatic();
    el.scrollTop = el.scrollHeight;
  }, [resetKey, applyStuck, markProgrammatic]);

  useEffect(() => {
    const started = Boolean(followOnSend) && !prevFollowRef.current;
    prevFollowRef.current = followOnSend;
    if (!started) return;
    forceToBottom('auto');
  }, [followOnSend, forceToBottom]);

  return { viewportRef, innerRef, stuck, scrollToBottom };
}

export function Conversation({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Flex
      vertical
      container="fill"
      className={`${styles.conversation} ${className || ''}`.trim()}
    >
      {children}
    </Flex>
  );
}

export function ConversationEmptyState({ children }: { children: ReactNode }) {
  return (
    <Flex container="fill" align="center" justify="center" className={styles.conversationEmpty}>
      {children}
    </Flex>
  );
}

export function ConversationScrollButton() {
  const api = useContext(ConversationViewportContext);
  if (!api || api.stuck) return null;
  return (
    <Button
      className={styles.scrollToBottom}
      size="small"
      aria-label="滚动到底部"
      icon={<ArrowDownOutlined />}
      onClick={() => api.scrollToBottom('smooth')}
    />
  );
}

export function ConversationViewport({
  children,
  resetKey,
  followOnSend,
}: {
  children: ReactNode;
  resetKey?: string | null;
  followOnSend?: boolean;
}) {
  const { viewportRef, innerRef, stuck, scrollToBottom } = useConversationViewport({
    resetKey,
    followOnSend,
  });
  const childList = Children.toArray(children);
  const overlay = childList.filter(
    (child) => isValidElement(child) && child.type === ConversationScrollButton
  );
  const content = childList.filter(
    (child) => !(isValidElement(child) && child.type === ConversationScrollButton)
  );

  return (
    <ConversationViewportContext.Provider value={{ stuck, scrollToBottom }}>
      <Flex vertical container="fill" className={styles.conversationViewport}>
        <div ref={viewportRef} className={styles.conversationBody}>
          <div ref={innerRef}>{content}</div>
        </div>
        {overlay}
      </Flex>
    </ConversationViewportContext.Provider>
  );
}
