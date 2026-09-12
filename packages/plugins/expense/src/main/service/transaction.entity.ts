import 'reflect-metadata';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@true-north/plugin-sdk/main';

@Entity('expense_transaction')
export class ExpenseTransaction extends BaseEntity {
  @Column({ type: 'varchar', length: 16 })
  type!: 'income' | 'expense';

  @Column('real')
  amount!: number;

  @Column('varchar', { length: 255, nullable: true })
  description?: string;

  @Column('varchar', { length: 64 })
  category!: string;

  @Column('simple-json', { nullable: true })
  tags?: string[];

  @Column('datetime')
  transactionDateTime!: Date;
}
