import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { EventsService } from "./events.service";
import { Event } from "./event.entity";

@Controller("api")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("events")
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Post("events")
  create(@Body() event: Event): Promise<Event> {
    return this.eventsService.create(event);
  }

  @Put("events/:id")
  update(@Param("id") id: string, @Body() event: Event): Promise<Event | null> {
    return this.eventsService.update(id, event);
  }

  @Delete("events/:id")
  remove(@Param("id") id: string): Promise<void> {
    return this.eventsService.remove(id);
  }

  @Get("calendar.ics")
  async getCalendarICS(@Res() res: Response) {
    const icsContent = await this.eventsService.generateICS();

    res
      .header("Content-Type", "text/calendar; charset=utf-8")
      .header("Content-Disposition", "attachment; filename=calendar.ics")
      .send(icsContent);
  }
}
