import { BaseEntity } from "../../base/base.entity";

export class TrackTime extends BaseEntity {
  startAt?: Date;

  endAt?: Date;

  duration?: number;

  notes?: string;
}
