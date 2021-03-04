import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private defaultApp: firebase.app.App;

    constructor() {
        // console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        this.defaultApp = firebase.initializeApp( {
            credential: firebase.credential.applicationDefault()
        } );
    }
}
