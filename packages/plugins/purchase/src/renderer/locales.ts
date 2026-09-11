import type { LocaleContribution } from '@true-north/plugin-sdk';

export const purchaseLocales: LocaleContribution = {
  pluginId: 'purchase',
  messages: {
    'zh-CN': {
      'menu.purchase': '采购',
      'today.purchase': '待购',
      'purchase.hub.description': '想买的东西与采购清单',
    },
    'en-US': {
      'menu.purchase': 'Purchase',
      'today.purchase': 'To buy',
      'purchase.hub.description': 'Things to buy and purchase lists',
    },
  },
};
