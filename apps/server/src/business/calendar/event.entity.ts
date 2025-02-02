import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  color: string;

  @Column({ nullable: true })
  description?: string;
}