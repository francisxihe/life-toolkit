import 'reflect-metadata';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@true-north/plugin-sdk/main';
import { PurchaseStatus } from '@true-north/enum';

@Entity('purchase_item')
export class PurchaseItem extends BaseEntity {
  @Column('varchar', { length: 255 })
  name!: string;

  @Column('real', { nullable: true })
  quantity?: number;

  @Column('varchar', { length: 32, nullable: true })
  unit?: string;

  @Column('date', { nullable: true })
  neededAt?: Date;

  @Column({ type: 'varchar', length: 16, default: PurchaseStatus.PENDING })
  status!: PurchaseStatus;

  @Column('datetime', { nullable: true })
  purchasedAt?: Date;

  @Column('text', { nullable: true })
  note?: string;

  @Column('varchar', { nullable: true })
  transactionId?: string;
}
