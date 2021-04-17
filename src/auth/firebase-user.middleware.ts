import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as firebase from 'firebase-admin';
import { auth } from 'firebase-admin/lib/auth';
import DecodedIdToken = auth.DecodedIdToken;


@Injectable()
export class FirebaseUserMiddleware implements NestMiddleware {

    async use( req: Request, res: Response, next: NextFunction ) {
        const { authorization } = req.headers;
        if ( authorization ) {
            const token = authorization.slice( 7 );
            req[ 'firebaseUser' ] = await firebase
                .auth()
                .verifyIdToken( token )
                .then( ( decodedIdToken: DecodedIdToken ) => {
                    return firebase.auth().getUser( decodedIdToken.uid );
                })
                .catch( err => null );
        }

        next()
    }
}
