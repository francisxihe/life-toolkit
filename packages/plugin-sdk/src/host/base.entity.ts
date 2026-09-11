import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({
    type: 'datetime',
    transformer: {
      to: (value: Date) => value,
      from: (value: string) => new Date(value),
    },
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'datetime',
    transformer: {
      to: (value: Date) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      from: (value: string) => dayjs(value).toDate(),
    },
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    nullable: true,
  })
  deletedAt?: Date;
}
