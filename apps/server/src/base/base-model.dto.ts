export class BaseModelDto {
  id: string;

  /** 创建时间 */
  createdAt: Date;

  /** 更新时间 */
  updatedAt: Date;

  /** 删除时间 */
  deletedAt?: Date;
}
