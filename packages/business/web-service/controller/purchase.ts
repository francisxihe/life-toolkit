import { request } from '../request';
import type { CreatePurchaseVo, PurchaseFilterVo, PurchaseVo, UpdatePurchaseVo } from '@true-north/vo';

export default class PurchaseController {
  static async list(query?: PurchaseFilterVo) {
    return request<{ list: PurchaseVo[] }>({ method: 'get' })('/purchase/list', query);
  }

  static async create(body: CreatePurchaseVo) {
    return request<PurchaseVo>({ method: 'post' })('/purchase/create', body);
  }

  static async update(id: string, body: UpdatePurchaseVo) {
    return request<PurchaseVo>({ method: 'put' })(`/purchase/update/${id}`, body);
  }

  static async delete(id: string) {
    return request<boolean>({ method: 'remove' })(`/purchase/delete/${id}`);
  }
}
