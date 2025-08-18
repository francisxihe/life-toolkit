import { randomUUID } from "crypto";
import type { TodoRepeatService } from "@life-toolkit/business-server";

// 轻量适配：仅返回含 id 的对象，避免在桌面侧为 Repeat 建表
export class DesktopTodoRepeatService implements TodoRepeatService {
  async create(dto: any): Promise<any> {
    return { id: randomUUID(), ...(dto as any) } as any;
  }

  async update(id: string, dto: any): Promise<any> {
    return { id, ...(dto as any) } as any;
  }
}
