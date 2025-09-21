import {
  EVENT_TYPES,
  EventPayloadMap,
} from '@/lib/queue/interface/events-name';
import { QueueName } from '@/lib/queue/interface/queue-name';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';

@Injectable()
export class RecognitionEventService {
  constructor(
    @InjectQueue(QueueName.RECOGNITION)
    private readonly notificationQueue: Queue,
  ) {}

  /**
   * Handles announcement creation events.
   */
  @OnEvent(EVENT_TYPES.RECOGNITION)
  async handleCreateAnnouncement(
    payload: EventPayloadMap[typeof EVENT_TYPES.RECOGNITION],
  ) {
    // Enqueue for processing by worker
    await this.notificationQueue.add(EVENT_TYPES.RECOGNITION, payload);
  }
}
