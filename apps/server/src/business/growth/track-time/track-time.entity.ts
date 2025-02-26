import { Entity, Column } from "typeorm";
import { BaseEntity } from "@/base/base.entity";

@Entity("track_time")
export class TrackTime extends BaseEntity {
  @Column({ nullable: true })
  startAt?: Date;

  @Column({ nullable: true })
  endAt?: Date;

  @Column({ nullable: true })
  duration?: number;

  @Column({ nullable: true })
  notes?: string;  
}  