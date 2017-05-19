import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

/**
 * Generated class for the Login page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {
email: any;
password: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AngularFireAuth) {
    this.auth.auth.signInWithEmailAndPassword(this.email, this.password).then(function(){
        console.log('success');
    }).catch(function(e){
        console.log(e);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
  }
}
