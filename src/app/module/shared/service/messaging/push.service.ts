import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { messaging } from 'firebase-admin/lib/messaging';
import MessagingPayload = messaging.MessagingPayload;
import MulticastMessage = messaging.MulticastMessage;

@Injectable()
export class PushService {
    private static BATCH_SIZE = 500;
    push: firebase.messaging.Messaging;

    constructor() {
        this.push = firebase.messaging();
    }

    sendPushNotificationToDevice( deviceToken: string, subject: string, text?: string ) {
        const payload: MessagingPayload = {
            notification: {
                title: subject,
                message: text,
            }
        };
        this.push.sendToDevice( deviceToken, payload );
    }

    async sendPushNotificationToDevices( tokens: string[], subject: string, text: string, url?: string ): Promise<void> {
        const batches = PushService.createBatches( tokens );

        await Promise.all( batches.map( async ( tokens: string[] ) => {
            const payload: MulticastMessage = {
                webpush: {
                    notification: {
                        title: subject,
                        body: text,
                        url
                    },
                },
                tokens
            };
            await this.push.sendMulticast( payload );
        }))
    }

    private static createBatches( tokens: string[] ): string[][] {
        return Array.from(
            { length: Math.ceil( tokens.length / PushService.BATCH_SIZE )},
            ( _, index ) => tokens.slice( index * PushService.BATCH_SIZE, ( index + 1 ) * PushService.BATCH_SIZE )
        );
    }
}
