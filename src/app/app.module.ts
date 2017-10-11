import { NgModule, ErrorHandler, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from "@ionic/storage"; 

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpService } from '../providers/http-service/http-service';
import { GlobalData } from '../providers/globaldata/GlobalData'
import { LoginService } from '../providers/loginservice/LoginService'
import { NativeService } from '../providers/nativeservice/NativeService'
import { Utils } from '../providers/utils/Utils'

import { AppVersion } from '@ionic-native/app-version';
import { Camera } from '@ionic-native/camera';
import { Toast } from '@ionic-native/toast';
import { File } from '@ionic-native/file/index';
import { Transfer } from '@ionic-native/transfer';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ImagePicker } from '@ionic-native/image-picker';
import { Network } from '@ionic-native/network';
import { AppMinimize } from "@ionic-native/app-minimize";
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { SkyRtcClientProvider } from '../providers/sky-rtc-client/sky-rtc-client';
import { AndroidPermissions } from '@ionic-native/android-permissions'

enableProdMode();
@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
      BrowserModule,
      IonicStorageModule.forRoot({
          name: '__MyApp',
          driverOrder: ['indexeddb', 'sqlite', 'websql']
      }),
    IonicModule.forRoot(MyApp),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
      HttpService,
      GlobalData,
      LoginService,
      NativeService,
      Utils,
      AppVersion,
      Camera,
      Toast,
      File,
      Transfer,
      InAppBrowser,
      ImagePicker,
      Network,
      AppMinimize,
      FingerprintAIO,
      SkyRtcClientProvider,
      AndroidPermissions
  ]
})
export class AppModule {}
