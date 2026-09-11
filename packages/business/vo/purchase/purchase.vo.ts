import type { PurchaseStatus } from '@true-north/enum';
import type { BaseEntityVo } from '../common';

export type PurchaseVo = BaseEntityVo & {
  name: string;
  quantity?: number;
  unit?: string;
  neededAt?: string;
  status: PurchaseStatus | `${PurchaseStatus}`;
  purchasedAt?: string;
  note?: string;
  transactionId?: string;
};

export type CreatePurchaseVo = {
  name: string;
  quantity?: number;
  unit?: string;
  neededAt?: string;
  status?: PurchaseStatus | `${PurchaseStatus}`;
  purchasedAt?: string;
  note?: string;
  transactionId?: string;
};

export type UpdatePurchaseVo = Partial<CreatePurchaseVo>;

export type PurchaseFilterVo = {
  status?: PurchaseStatus | `${PurchaseStatus}`;
  keyword?: string;
  neededFrom?: string;
  neededTo?: string;
};
