import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column()
  period: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  spent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
