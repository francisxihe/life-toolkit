
import {  PrimaryKey, Property } from "@mikro-orm/core";

export class BaseEntity {
  @PrimaryKey()
  id: string;

  /** 创建时间 */
  @Property({ type: "date" })
  createdAt: Date;

  /** 更新时间 */
  @Property({ type: "date" })
  updatedAt: Date;

  /** 是否删除 */
  @Property({ type: "date", nullable: true })
  deletedAt?: Date;
}
