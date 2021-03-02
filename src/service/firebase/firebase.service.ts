import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
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
export class FirebaseService {
    private defaultApp: firebase.app.App;

    constructor() {
        this.defaultApp = firebase.initializeApp( {
            credential: firebase.credential.cert( firebaseParams ),
            databaseURL: 'https://pleagan-c27f2-default-rtdb.firebaseio.com'
        } );
    }
}
