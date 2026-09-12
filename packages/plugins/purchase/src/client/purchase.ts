import { pluginIpc } from './port';
import type { CreatePurchaseVo, PurchaseFilterVo, PurchaseVo, UpdatePurchaseVo } from '@true-north/vo';

export default class PurchaseController {
  static async list(query?: PurchaseFilterVo) {
    return pluginIpc().get<{ list: PurchaseVo[] }>('/purchase/list', query);
  }

  static async create(body: CreatePurchaseVo) {
    return pluginIpc().post<PurchaseVo>('/purchase/create', body);
  }

  static async update(id: string, body: UpdatePurchaseVo) {
    return pluginIpc().put<PurchaseVo>(`/purchase/update/${id}`, body);
  }

  static async delete(id: string) {
    return pluginIpc().remove<boolean>(`/purchase/delete/${id}`);
  }
}
