import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PreauthMiddleware } from '../shared/middleware/preauth.middleware';
import { SharedModule } from '../shared/shared.module';
import { InboxService } from './service/inbox/inbox.service';
import { InboxController } from './controller/inbox/inbox.controller';

const services = [
    InboxService
];

@Module({
    imports: [ SharedModule ],
    controllers: [ InboxController ],
    providers: services,
    exports: services,
})
export class InboxModule implements NestModule {
    configure( consumer: MiddlewareConsumer ): any {
        consumer
            .apply( PreauthMiddleware )
            .forRoutes(
                // User has to be logged in for all /inbox endpoints
                { path: '/inbox/*', method: RequestMethod.ALL }
            );
    }
}
