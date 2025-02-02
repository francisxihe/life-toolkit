import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ExcelData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('json')
  data: any;

  @Column()
  filename: string;

  @CreateDateColumn()
  createdAt: Date;
}