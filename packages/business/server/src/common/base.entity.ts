import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// 添加dayjs插件
dayjs.extend(timezone);
dayjs.extend(utc);

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** 创建时间 */
  @CreateDateColumn({
    type: 'datetime',
    transformer: {
      to: (value: Date) => value,
      from: (value: string) => new Date(value),
    },
  })
  createdAt!: Date;

  /** 更新时间 */
  @UpdateDateColumn({
    type: 'datetime',
    transformer: {
      to: (value: Date) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      from: (value: string) => dayjs(value).toDate(),
    },
  })
  updatedAt!: Date;

  /** 是否删除 */
  @DeleteDateColumn({
    nullable: true,
  })
  deletedAt?: Date;
}
