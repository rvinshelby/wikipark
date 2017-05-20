import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AngularFireAuth, private alertCtrl: AlertController) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
  }

  login() {
        this.auth.auth.signInWithEmailAndPassword(this.email, this.password).then((response) => {
        let currentuser = {
          uid : response.uid,
          email : response.email,
          password : response.photoURL
        };
        window.localStorage.setItem('currentuser', JSON.stringify(currentuser));
        this.navCtrl.pop();
    }).catch((e) => {
        let alert = this.alertCtrl.create({
          title : 'Oops something went wrong!',
          subTitle : e.message,
          buttons : ['Dismiss']
        });
        alert.present();
    });
  }
}
