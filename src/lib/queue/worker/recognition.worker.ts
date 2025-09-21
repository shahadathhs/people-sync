import { ENVEnum } from '@/common/enum/env.enum';
import { AppGateway } from '@/lib/gateway/app.gateway';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { RecognitionEvent } from '@/lib/queue/interface/events-payload';
import { QueueName } from '@/lib/queue/interface/queue-name';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

@Injectable()
export class RecognitionWorker implements OnModuleInit {
  private logger = new Logger(RecognitionWorker.name);

  constructor(
    private readonly gateway: AppGateway,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    new Worker<RecognitionEvent>(
      QueueName.RECOGNITION,
      async (job) => {
        const {
          action,
          info: { title, recipients },
          meta: { createdAt, performedBy, recognitionId },
        } = job.data;

        try {
          // * Send Socket Notification
          this.gateway.notifyMultipleUsers(
            recipients.map((recipient) => recipient.id),
            action,
            {
              type: action,
              title,
              createdAt,
              message: 'Test Message',
              meta: { recognitionId },
            },
          );

          // * Store the notification in the database
          await this.prisma.notification.create({
            data: {
              type: 'Recognition',
              title,
              message: 'Test Message',
              meta: {
                recognitionId,
                performedBy,
                createdAt,
              },
              users: {
                createMany: {
                  data: recipients.map((recipient) => ({
                    userId: recipient.id,
                  })),
                },
              },
            },
          });
        } catch (err) {
          this.logger.error(
            `Failed to process recognition event ${action}: ${err.message}`,
            err.stack,
          );
        }
      },
      {
        connection: {
          host: this.config.getOrThrow(ENVEnum.REDIS_HOST),
          port: +this.config.getOrThrow(ENVEnum.REDIS_PORT),
        },
      },
    );
  }
}
