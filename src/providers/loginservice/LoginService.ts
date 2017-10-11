import {Injectable } from '@angular/core';
import { HttpService } from '../../providers/http-service/http-service'
import { APP_SERVE_URL } from '../../providers/constants/Constants'
import { GlobalData } from "../globaldata/GlobalData";
import { NativeService } from "../nativeservice/NativeService";
import { Md5 } from "ts-md5/dist/md5";
import { SkyRtcClientProvider } from '../../providers/sky-rtc-client/sky-rtc-client'

@Injectable()
export class LoginService {
    public hasUser: boolean = false;
    constructor(public httpService: HttpService,
        public globalData: GlobalData,
        public nativeService: NativeService,
        public srcp: SkyRtcClientProvider) {
    }

    Register(param) {
        return this.httpService.post(APP_SERVE_URL + 'signup', param);
    }

    SignIn(param) {
        return this.httpService.post(APP_SERVE_URL + 'user/accesstoken', param);
    }

    Verify() {
        return this.httpService.get(APP_SERVE_URL + 'users/info');
    }
    RefreshToken() {
        return this.httpService.get(APP_SERVE_URL + 'users/refresh_token');
    }

    /**
 *显示指纹登陆
 */
    showFingerLogin() {
        this.nativeService.faio.show({
            clientId: 'Fingerprint-Demo',
            clientSecret: 'password', //Only necessary for Android
            disableBackup: true  //Only for Android(optional)
        })
            .then((result: any) => {
                this.nativeService.showLoading();
                this.RefreshToken().subscribe(response => {
                    this.nativeService.hideLoading();
                    if (response.json().success == true) {
                        this.nativeService.storage.set("token", response.json().token);
                        this.globalData.token = response.json().token;
                        this.globalData.isLogined = true;
                        this.SocketConnect();

                    }
                    else {
                        this.nativeService.showToast(response.json().message);
                        this.nativeService.modalCtrl.create('LoginPage').present();
                    }
                });
            })
            .catch((error: any) => { });
    }
    /**
    *用户名密码登陆
    */
    Login(username: string, password: string) {
        this.nativeService.showLoading();
        this.SignIn({ name: username, password: Md5.hashStr(password).toString() }).subscribe(response => {
            this.nativeService.hideLoading();
            if (response.json().success == false) {
                if (response.json().hasuser == false) {
                    this.nativeService.alertCtrl.create({
                        title: '用户不存在',
                        message: "是否注册？",
                        buttons: [
                            {
                                text: '是',
                                handler: data => {
                                    this.nativeService.modalCtrl.create('RegisterPage').present();
                                }
                            },
                            {
                                text: '否',
                                handler: data => {
                                }
                            }
                        ]
                    }).present();
                }
                else {
                    this.nativeService.showToast(response.json().message);
                }
            }
            else if (response.json().success == true) {
                this.globalData.token = response.json().token;
                this.nativeService.showToast(response.json().message);
                this.globalData.isLogined = true;
                this.hasUser = true;
                this.nativeService.storage.set("token", this.globalData.token);
                this.nativeService.storage.set("username", username);
                this.nativeService.storage.set("isLogined", true);
                this.SocketConnect();
            }
        });
    }
    /**
    *注销数据处理
    */
    Logout() {
        this.globalData.isLogined = false;
        this.nativeService.storage.clear();
        this.globalData.token = "";
        this.hasUser = false;
        this.srcp.disconnect();
    }
    SocketConnect()
    {
        this.srcp.connect("ws:10.32.6.39:3000", this.globalData.username);
    }
}