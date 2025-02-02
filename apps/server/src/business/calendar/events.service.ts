import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "./event.entity";
import * as ical from "ical-generator";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>
  ) {}

  findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  create(event: Event): Promise<Event> {
    return this.eventsRepository.save(event);
  }

  async update(id: string, event: Event): Promise<Event | null> {
    await this.eventsRepository.update(id, event);
    return this.eventsRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.eventsRepository.delete(id);
  }

  async generateICS(): Promise<string> {
    const events = await this.eventsRepository.find();
    const calendar = ical.default({ name: "My Calendar" });

    events.forEach((event) => {
      const startDate = new Date(`${event.date}T${event.startTime}`);
      const endDate = new Date(`${event.date}T${event.endTime}`);

      calendar.createEvent({
        id: event.id,
        start: startDate,
        end: endDate,
        summary: event.title,
        description: event.description,
        created: new Date(),
      });
    });

    return calendar.toString();
  }
}
