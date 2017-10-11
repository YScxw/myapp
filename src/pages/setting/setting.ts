import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../providers/nativeservice/NativeService'

/**
 * Generated class for the SettingPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {

    constructor(public navCtrl: NavController, public navParams: NavParams,public nativeService: NativeService) {
  }
  save() {
      this.nativeService.storage.set("useFingerPrint", this.nativeService.globalData.useFingerPrint);
  }
}
