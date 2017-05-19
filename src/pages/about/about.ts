import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Login } from '../login/login';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(public navCtrl: NavController) {
    if (!this.isLoggedin()) {
      console.log('You are not logged in');
      this.navCtrl.push(Login);
    }
  }
  isLoggedin() {
    if (window.localStorage.getItem('currentuser')) {
      return true;
    }
  }
}
