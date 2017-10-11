import { Injectable } from '@angular/core';

@Injectable()
export class GlobalData {

  private _password: string;//用户密码
  private _username: string;//用户名
  private _token: string;//token
  private _showLoading: boolean = true;//请求是否显示loading,注意:设置为true,当请求执行后需要设置为false
  private _isLogined: boolean = false;
  private _hasFingerPrint: boolean = false;
  private _useFingerPrint: boolean = false;


  get useFingerPrint(): boolean {
      return this._useFingerPrint;
  }

  set useFingerPrint(value: boolean) {
      this._useFingerPrint = value;
  }

  get hasFingerPrint(): boolean {
      return this._hasFingerPrint;
  }

  set hasFingerPrint(value: boolean) {
      this._hasFingerPrint = value;
  }

  get isLogined(): boolean {
      return this._isLogined;
  }

  set isLogined(value: boolean) {
      this._isLogined = value;
  }

  get password(): string {
      return this._password;
  }

  set password(value: string) {
      this._password = value;
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  get token(): string {
    return this._token;
  }

  set token(value: string) {
    this._token = value;
  }

  get showLoading(): boolean {
    return this._showLoading;
  }

  set showLoading(value: boolean) {
    this._showLoading = value;
  }
}
