import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { auth } from 'firebase-admin/lib/auth';
import UserRecord = auth.UserRecord;
import ListUsersResult = auth.ListUsersResult;
import { PleaganService } from '../pleagan/pleagan.service';
import { Pleagan } from '../../model/pleagan';
import { IPleagan } from 'pleagan-model';
import * as serviceAccount from '../../auth/firebaseServiceAccount.json';

const firebaseParams = {
    type: serviceAccount.type,
    projectId: serviceAccount.projectId,
    privateKeyId: serviceAccount.privateKeyId,
    privateKey: serviceAccount.privateKey,
    clientEmail: serviceAccount.clientEmail,
    clientId: serviceAccount.clientId,
    authUri: serviceAccount.authUri,
    tokenUri: serviceAccount.tokenUri,
    authProviderX509CertUrl: serviceAccount.authProviderX509CertUrl,
    clientC509CertUrl: serviceAccount.clientC509CertUrl
};

@Injectable()
export class AuthService {
    private defaultApp: firebase.app.App;

    constructor( private pleaganService: PleaganService ) {
        this.defaultApp = firebase.initializeApp( {
            credential: firebase.credential.cert( firebaseParams ),
            databaseURL: 'https://pleagan-c27f2-default-rtdb.firebaseio.com'
        } );

        this.verifyUserDataSynchronized();
    }

    async getAllRegisteredUsers( nextPageToken?: string ): Promise<UserRecord[]> {
        const users: UserRecord[] = [];
        return firebase
            .auth()
            .listUsers( 1000, nextPageToken )
            .then( ( result: ListUsersResult ) => {
                users.push( ...result.users );
                if ( result.pageToken ) {
                    return this.getAllRegisteredUsers( result.pageToken )
                } else {
                    return users;
                }
            })
    }

    async verifyUserDataSynchronized(): Promise<void> {
        return new Promise( async ( resolve, reject ) => {
            const registeredUsers = await this.getAllRegisteredUsers();
            const storedUsers = await this.pleaganService.getAllPleaganUids();

            for ( const registeredUser of registeredUsers ) {
                if ( !storedUsers.find( ( storedUser: Pleagan ) => storedUser.uid === registeredUser.uid ) ) {
                    const user: IPleagan = {
                        uid: registeredUser.uid,
                        displayName: registeredUser.displayName || '',
                        email: registeredUser.email,
                        emailVerified: registeredUser.emailVerified,
                    };
                    this.pleaganService.addPleagan( user );
                }
            }

            resolve();
        });
    }
}
