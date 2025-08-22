import "reflect-metadata";
import { Entity, Column } from "typeorm";
import { BaseEntity } from "../base.entity";

@Entity("user")
export class User extends BaseEntity {
  @Column('varchar', { length: 255 })
  username: string;

  @Column('varchar', { length: 255 })
  password: string;

  @Column('varchar', { length: 255, nullable: true })
  name?: string;
}