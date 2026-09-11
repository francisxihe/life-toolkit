import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('plugin_schema_ledger')
export class PluginSchemaLedger {
  @PrimaryColumn('varchar')
  pluginId!: string;

  @Column('int')
  version!: number;

  @Column('datetime')
  appliedAt!: Date;
}
