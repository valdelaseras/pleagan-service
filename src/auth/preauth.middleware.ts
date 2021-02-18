import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as firebase from 'firebase-admin';
import * as serviceAccount from './firebaseServiceAccount.json';
import { LoggerService } from '../service/logger/logger.service';

const firebaseParams = {
    type: serviceAccount.type,
    projectId: serviceAccount.projectId,
    privateKeyId: serviceAccount.privateKeyId,
    privateKey: serviceAccount.privateKey,
    clientEmail: serviceAccount.clientEmail,
    clientId: serviceAccount.clientId,
    authUri: serviceAccount. authUri,
    tokenUri: serviceAccount.tokenUri,
    authProviderX509CertUrl: serviceAccount.authProviderX509CertUrl,
    clientC509CertUrl: serviceAccount. clientC509CertUrl
};

@Injectable()
export class PreauthMiddleware implements NestMiddleware {
    private defaultApp: firebase.app.App;

    constructor() {
        this.defaultApp = firebase.initializeApp({
            credential: firebase.credential.cert( firebaseParams ),
            databaseURL: 'https://pleagan-c27f2-default-rtdb.firebaseio.com'
        })
    }

    async use( req: Request, res: Response, next: NextFunction ) {
        const { authorization } = req.headers;
        if ( authorization ) {
            const token = authorization.slice(7);
            req['firebaseUser'] = await firebase
                .auth()
                .verifyIdToken( token )
                .catch(err => {
                    const message = `Token could not be verified for call to ${ req.path }`;
                    LoggerService.warn( message );
                    throw new HttpException({ message, err }, HttpStatus.UNAUTHORIZED)
                });

            next()
        } else {
            throw new HttpException({ message: 'Not logged in' }, HttpStatus.UNAUTHORIZED)
        }
    }
}
