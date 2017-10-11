import { Component } from '@angular/core';
import { NavController, IonicPage, Platform } from 'ionic-angular';
import { GlobalData } from '../../providers/globaldata/GlobalData'
import { NativeService } from '../../providers/nativeservice/NativeService'
import { LoginService } from '../../providers/loginservice/LoginService'

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {
    constructor(public platform: Platform,public navCtrl: NavController, public globaldata: GlobalData, public loginService:LoginService,public nativeService: NativeService)
    {
        this.nativeService.checkPermission();
        this.nativeService.faio.isAvailable().then(result => {
            console.log(result);
            this.globaldata.hasFingerPrint = true;
            this.nativeService.storage.get("useFingerPrint").then(useFingerPrint => {
                this.globaldata.useFingerPrint = useFingerPrint;
            }).catch(err => {
                this.globaldata.useFingerPrint = false;
            });
        }).catch(err => {
                this.globaldata.hasFingerPrint = false;
            })
        this.nativeService.storage.get("isLogined").then(isLogined => {
            this.loginService.hasUser = isLogined;
            if (isLogined)
            {
                this.login();
            }
        }).catch(err => {
            this.loginService.hasUser = false;
        });
        
        this.nativeService.storage.get("username").then(username =>
        {
            this.globaldata.username = username;
        }).catch(err => {
        });
       
        this.nativeService.storage.get("token").then(token => {
            this.globaldata.token = token;
        }).catch(err => {
            });
        
    }
    checkToken() {
        this.nativeService.showLoading();
        this.loginService.Verify().subscribe(response => {
            this.nativeService.hideLoading();
            this.nativeService.showToast(response.json().message);
            if (response.json().success == false)
            {
                this.loginService.hasUser = false;
                this.login();
            }
        });
    }
    login() {
        if (this.loginService.hasUser && this.globaldata.hasFingerPrint && this.globaldata.useFingerPrint)
        {
            this.loginService.showFingerLogin();
        }
        else
        {
            this.nativeService.modalCtrl.create('LoginPage').present();
        }
    }
    logout() {
        this.nativeService.alertCtrl.create({
            title: '警告',
            message: "确定注销登录吗？",
            buttons: [
                {
                    text: '是',
                    handler: data => {
                        this.loginService.Logout();
                    }
                },
                {
                    text: '否'
                }
            ]
        }).present();
    }
    showVideoGroup()
    {
        this.nativeService.modalView = this.nativeService.modalCtrl.create('VideogroupPage');
        this.nativeService.modalView.present();
    }
}
