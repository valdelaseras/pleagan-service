import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private defaultApp: firebase.app.App;

    constructor() {
        this.defaultApp = firebase.initializeApp( {
            credential: firebase.credential.applicationDefault()
        } );
    }

    removeUser( uid: string ): Promise<void> {
        return firebase.auth().deleteUser( uid )
    }
}
