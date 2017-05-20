import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Login } from '../login/login';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
spaces: FirebaseListObservable<any>;
parkingspaces: any;
  constructor(public navCtrl: NavController, private db: AngularFireDatabase, private auth: AngularFireAuth) {
    if (!this.isLoggedin()) {
      console.log('You are not logged in');
      this.navCtrl.push(Login);
    }
    this.spaces = db.list('/parking_spaces');
  }

  ngOnInit() {
    this.spaces.subscribe((parking_spaces) => {
      this.parkingspaces = parking_spaces;
    });
  }
  isLoggedin() {
    if (window.localStorage.getItem('currentuser')) {
      return true;
    }
  }

  signOut() {
    window.localStorage.removeItem('currentuser');
    this.auth.auth.signOut();
    location.reload();
  }

  setAvail(space) {
    this.spaces.update(space.$key, { state : 1 });
  }

  setNotAvail(space) {
    this.spaces.update(space.$key, { state : 0 });
  }

  isAvailable(space) {
    if(space.state == 1) {
      return true;
    } else {
      return false;
    }
  }

  isNotAvailable(space) {
    if(space.state == 0) {
      return true;
    } else {
      return false;
    }
  }
}
