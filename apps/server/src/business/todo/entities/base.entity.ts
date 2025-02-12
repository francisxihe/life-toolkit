import { BaseEntity } from "@/base/base.entity";
import { TodoStatus } from "./enum";
import { Property } from "@mikro-orm/core";

export class BaseTodoEntity extends BaseEntity {
  /** 待办名称 */
  @Property({ fieldName: "name" })
  name: string;

  /** 待办事项状态 */
  @Property({ fieldName: "status", nullable: true })
  status: TodoStatus;

  /** 待办描述 */
  @Property({ fieldName: "description", nullable: true })
  description?: string;

  /** 待办重要程度 */
  @Property({ fieldName: "importance", nullable: true })
  importance?: number;

  /** 待办紧急程度 */
  @Property({ fieldName: "urgency", nullable: true })
  urgency?: number;

  /** 待办标签 */
  @Property({ fieldName: "tags", type: "simple-array" })
  tags: string[];

  /** 待办完成时间 */
  @Property({ fieldName: "doneAt", type: "datetime", nullable: true })
  doneAt?: Date;

  /** 放弃待办时间 */
  @Property({ fieldName: "abandonedAt", type: "datetime", nullable: true })
  abandonedAt?: Date;

  /** 计划待办开始时间 */
  @Property({ fieldName: "planStartAt", type: "time", nullable: true })
  planStartAt?: string;

  /** 计划待办结束时间 */
  @Property({ fieldName: "planEndAt", type: "time", nullable: true })
  planEndAt?: string;
}
