import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../providers/nativeservice/NativeService'
import { LoginService } from '../../providers/loginservice/LoginService'
import { GlobalData } from '../../providers/globaldata/GlobalData'
import { Md5 } from "ts-md5/dist/md5";

/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage
{
    tel: string;
    constructor(public navCtrl: NavController, public navParams: NavParams, public loginService: LoginService, public nativeService: NativeService, public globaldata: GlobalData) {
    }
    logForm() {
        this.nativeService.showLoading();
        this.loginService.Register({ name: this.globaldata.username, password: Md5.hashStr(this.globaldata.password).toString(), tel: this.tel }).subscribe(response => {
            this.nativeService.hideLoading();
            this.nativeService.showToast(response.json().message);
            if (response.json().success == true)
            {
                this.navCtrl.pop();
            }
        });
    }
}
