import { Module } from '@nestjs/common';
import { PersistenceService } from './service/persistence/persistence.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { EmailService } from './service/messaging/email.service';
import { FirebaseService } from './service/firebase/firebase.service';
import { MessagingService } from './service/messaging/messaging.service';
import { PushService } from './service/messaging/push.service';

const services = [
  PersistenceService,
  EmailService,
  FirebaseService,
  MessagingService,
  PushService,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [ configuration ]
    }),
  ],
  providers: services,
  exports: services,
})
export class SharedModule {}
