export class BaseModelEntity {
  id: string;

  /** 创建时间 */
  createdAt: Date;

  /** 更新时间 */
  updatedAt: Date;

  deletedAt: Date | null;
}
