export class BaseModelDto {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
}

export const ModelKeys = ['id', 'createdAt', 'updatedAt', 'deletedAt'] as const;
