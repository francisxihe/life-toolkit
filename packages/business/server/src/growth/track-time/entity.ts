
import { BaseEntity } from "@business/common";

export class TrackTime extends BaseEntity {
  startAt?: Date;

  endAt?: Date;

  duration?: number;

  notes?: string;
}
