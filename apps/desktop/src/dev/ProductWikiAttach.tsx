import { useEffect } from 'react';
import { attachProductWiki } from '@ylib/product-server/agent';
import { useProductRouterPort } from '@ylib/product-surface-react/router';

export function ProductWikiAttach() {
  const router = useProductRouterPort();

  useEffect(() => {
    const handle = attachProductWiki({ router });
    return () => {
      handle.destroy();
    };
  }, [router]);

  return null;
}
