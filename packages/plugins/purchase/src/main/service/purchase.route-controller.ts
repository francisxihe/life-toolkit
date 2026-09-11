import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@true-north/plugin-sdk/host';
import type { CreatePurchaseVo, PurchaseFilterVo, PurchaseVo, UpdatePurchaseVo } from '@true-north/vo';
import { purchaseService } from './purchase.service';

@Controller('/purchase')
export class PurchaseController {
  @Get('/list', { description: '采购列表' })
  async list(@Query() query?: PurchaseFilterVo): Promise<{ list: PurchaseVo[] }> {
    return { list: await purchaseService.list(query) };
  }

  @Post('/create', { description: '创建采购项' })
  async create(@Body() body: CreatePurchaseVo): Promise<PurchaseVo> {
    return purchaseService.create(body);
  }

  @Put('/update/:id', { description: '更新采购项' })
  async update(@Param('id') id: string, @Body() body: UpdatePurchaseVo): Promise<PurchaseVo> {
    return purchaseService.update(id, body);
  }

  @Delete('/delete/:id', { description: '删除采购项' })
  async delete(@Param('id') id: string): Promise<boolean> {
    return purchaseService.delete(id);
  }
}
