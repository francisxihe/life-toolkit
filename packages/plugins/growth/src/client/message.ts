import { message } from '@sue/design-web-react';

export const Message = {
  error(params: unknown) {
    if (params instanceof Error) message.error(params.message);
    else if (typeof params === 'string') message.error(params);
    else message.error('Unknown error type');
  },
  success(params: unknown) {
    message.success(typeof params === 'string' ? params : 'Unknown success type');
  },
  info(params: unknown) {
    message.info(typeof params === 'string' ? params : 'Unknown info type');
  },
  warning(params: unknown) {
    message.warning(typeof params === 'string' ? params : 'Unknown warning type');
  },
};
