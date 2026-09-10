import type {
  BrowserActivateTabRequestVo,
  BrowserBoundsVo,
  BrowserExtractResultVo,
  BrowserNavigateRequestVo,
  BrowserStateVo,
  BrowserVisibleRequestVo,
} from '@true-north/vo';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@business/decorators';
import { embeddedBrowserHost } from './embedded-browser.host';

@Controller('/browser')
export class BrowserController {
  constructor(private readonly host = embeddedBrowserHost) {}

  @Get('/state', { description: '内嵌浏览器当前状态' })
  async getState(): Promise<BrowserStateVo> {
    return this.host.getState();
  }

  @Put('/visible', { description: '打开或关闭浏览器官方面板' })
  async setVisible(@Body() body: BrowserVisibleRequestVo): Promise<BrowserStateVo> {
    return this.host.setVisible(Boolean(body?.visible));
  }

  @Put('/bounds', { description: '同步浏览舞台窗口坐标' })
  async setBounds(@Body() body: BrowserBoundsVo): Promise<BrowserStateVo> {
    return this.host.setBounds({
      x: Number(body?.x) || 0,
      y: Number(body?.y) || 0,
      width: Number(body?.width) || 0,
      height: Number(body?.height) || 0,
    });
  }

  @Post('/tabs', { description: '新建标签' })
  async createTab(@Body() body?: { url?: string }): Promise<BrowserStateVo> {
    return this.host.createTab(body?.url);
  }

  @Delete('/tabs/:id', { description: '关闭标签' })
  async closeTab(@Param('id') id: string): Promise<BrowserStateVo> {
    return this.host.closeTab(id);
  }

  @Put('/tabs/:id/activate', { description: '切换当前标签' })
  async activateTab(@Param('id') id: string, @Body() _body?: BrowserActivateTabRequestVo): Promise<BrowserStateVo> {
    return this.host.activateTab(id);
  }

  @Post('/tabs/:id/navigate', { description: '打开网址' })
  async navigate(@Param('id') id: string, @Body() body: BrowserNavigateRequestVo): Promise<BrowserStateVo> {
    return this.host.navigate(id, body?.url ?? '');
  }

  @Post('/tabs/:id/back', { description: '后退' })
  async goBack(@Param('id') id: string): Promise<BrowserStateVo> {
    return this.host.goBack(id);
  }

  @Post('/tabs/:id/forward', { description: '前进' })
  async goForward(@Param('id') id: string): Promise<BrowserStateVo> {
    return this.host.goForward(id);
  }

  @Post('/tabs/:id/reload', { description: '刷新' })
  async reload(@Param('id') id: string): Promise<BrowserStateVo> {
    return this.host.reload(id);
  }

  @Post('/tabs/:id/extract', { description: '拉取当前标签正文并落盘' })
  async extractTab(@Param('id') id: string): Promise<BrowserExtractResultVo> {
    return this.host.extractTab(id);
  }
}
