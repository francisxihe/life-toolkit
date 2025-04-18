import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsObject } from "class-validator";
import { RepeatMode, RepeatConfig, RepeatEndMode } from "../types";

export class Repeat {
  /** 主键 */
  @PrimaryGeneratedColumn()
  id!: string;

  /** 重复模式 */
  @Column({
    type: "enum", 
    enum: RepeatMode,
  })
  repeatMode!: RepeatMode;

  /** 重复配置 */
  @Column("json")
  @IsObject()
  repeatConfig!: RepeatConfig;
 
  /** 重复结束模式 */
  @Column({
    type: "enum",
    enum: RepeatEndMode,
  })
  repeatEndMode!: RepeatEndMode;

  /** 重复次数 */
  @Column({
    type: "int",
  })
  repeatTimes?: number;

  /** 重复结束日期 */
  @Column({
    type: "date",
  })
  repeatEndDate?: string;
}
