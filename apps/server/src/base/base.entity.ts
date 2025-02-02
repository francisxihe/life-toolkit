import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

export class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** 创建时间 */
  @CreateDateColumn()
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn()
  updatedAt: Date;

  /** 是否删除 */
  @DeleteDateColumn()
  deletedAt: Date;
}
