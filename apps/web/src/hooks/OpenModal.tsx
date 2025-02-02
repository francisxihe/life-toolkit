import { Modal } from '@arco-design/web-react';
import type { ConfirmProps } from '@arco-design/web-react/es/Modal/confirm';

export function openModal(modalOption: ConfirmProps = {}) {
  return Modal.confirm({
    icon: null,
    closable: true,
    ...modalOption,
  });
}
