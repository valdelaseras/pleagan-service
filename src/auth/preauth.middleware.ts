import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../service/logger/logger.service';
import * as firebase from 'firebase-admin';
import { auth } from 'firebase-admin/lib/auth';
import DecodedIdToken = auth.DecodedIdToken;


@Injectable()
export class PreauthMiddleware implements NestMiddleware {

    async use( req: Request, res: Response, next: NextFunction ) {
        const { authorization } = req.headers;
        if ( authorization ) {
            const token = authorization.slice( 7 );
            req['firebaseUser'] = await firebase
                .auth()
                .verifyIdToken( token )
                .then( ( decodedIdToken: DecodedIdToken ) => {
                    return firebase.auth().getUser( decodedIdToken.uid );
                })
                .catch( err => {
                    console.log(err);
                    const message = `Token could not be verified for call to ${ req.path }`;
                    LoggerService.warn( message );
                    throw new HttpException( { message, err }, HttpStatus.UNAUTHORIZED )
                } );

            next()
        } else {
            throw new HttpException( { message: 'Not logged in' }, HttpStatus.UNAUTHORIZED )
        }
    }
}
