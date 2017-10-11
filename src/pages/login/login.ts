import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../providers/nativeservice/NativeService'
import { GlobalData } from '../../providers/globaldata/GlobalData'
import { LoginService } from '../../providers/loginservice/LoginService'

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
    constructor(public navCtrl: NavController, public navParams: NavParams, public nativeService: NativeService, public globaldata: GlobalData, public loginService: LoginService)
    {
     }
    logForm()
    {
      this.loginService.Login(this.globaldata.username, this.globaldata.password);
      this.navCtrl.pop();
  }
}
