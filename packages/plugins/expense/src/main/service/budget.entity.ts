import 'reflect-metadata';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@true-north/plugin-sdk/host';

@Entity('expense_budget')
export class ExpenseBudget extends BaseEntity {
  @Column('varchar', { length: 64 })
  category!: string;

  @Column('real')
  amount!: number;

  @Column({ type: 'varchar', length: 16 })
  period!: 'monthly' | 'yearly';

  @Column('date')
  startDate!: Date;

  @Column('date', { nullable: true })
  endDate?: Date;
}
