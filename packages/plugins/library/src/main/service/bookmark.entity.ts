import 'reflect-metadata';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@true-north/plugin-sdk/host';
import { BookmarkFileStatus } from '@true-north/enum';

@Entity('bookmark')
export class Bookmark extends BaseEntity {
  @Column('varchar', { length: 255 })
  title!: string;

  @Column('varchar', { length: 2048 })
  url!: string;

  @Column('text', { nullable: true })
  excerpt?: string;

  @Column('simple-json', { nullable: true })
  tags?: string[];

  @Column('datetime')
  savedAt!: Date;

  @Column('varchar', { length: 1024, nullable: true })
  markdownPath?: string;

  @Column('varchar', { length: 1024, nullable: true })
  articleDir?: string;

  @Column({ type: 'varchar', length: 16, default: BookmarkFileStatus.OK })
  fileStatus!: BookmarkFileStatus;
}
