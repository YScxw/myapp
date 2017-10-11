import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController} from 'ionic-angular';
import { SkyRtcClientProvider } from '../../providers/sky-rtc-client/sky-rtc-client'
/**
 * Generated class for the VideogroupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-videogroup',
  templateUrl: 'videogroup.html',
})
export class VideogroupPage {
    video: boolean=true;
    audio: boolean = true;
    cameraDeviceId;
    contacts = [];

    front: boolean = true;
    constructor(public menuCtrl: MenuController,public navCtrl: NavController, public navParams: NavParams, public srcp: SkyRtcClientProvider)
    {
    }
    changeId(id)
    {
        if (id === "me")
        {
            document.getElementById(id).setAttribute("id", "other");
        }
        else
        {
            document.getElementById(id).setAttribute("id", "me");
        }
    }
    ionViewDidLoad() {
        this.srcp.events.subscribe('pc_add_stream', (stream, username) =>
        {
            if (document.getElementById(username))
            {
                document.getElementById(username).setAttribute("src", URL.createObjectURL(stream));
            }
            else
            {
                if (username === this.srcp.me)
                {
                    let change = () => {
                        if (document.getElementById("me").getAttribute("class") === "small") {
                            document.getElementById("me").setAttribute("class", "big");
                            document.getElementById("other").setAttribute("class", "small");
                            document.getElementById("me").removeEventListener("click");
                            document.getElementById("other").addEventListener("click", change);
                        }
                        else {
                            document.getElementById("me").setAttribute("class", "small");
                            document.getElementById("other").setAttribute("class", "big");
                            document.getElementById("other").removeEventListener("click");
                            document.getElementById("me").addEventListener("click", change);
                        }
                    };
                    document.getElementById("me").setAttribute("src", URL.createObjectURL(stream));
                    document.getElementById("me").addEventListener("click", change);
                }
                else
                {
                    document.getElementById("other").setAttribute("src", URL.createObjectURL(stream));
                }
            }
        });
        this.srcp.events.subscribe('pc_remove_stream', (username) => {
            let video = document.getElementById(username);
            if (video)
            {
                document.removeChild(video);
            }
        });
        
        let room = this.navParams.get("room") || "__default";
        this.srcp.joinRoom(room);
    }
    ionViewWillLeave() {
        this.srcp.leaveRoom();
    }
    updateLocalStream(option)
    {
        if (option === "video")
        {
            this.srcp.videoStreamTrack.enabled = this.video;
        }
        else if (option === "audio") {
            this.srcp.audioStreamTrack.enabled = this.audio;
        }
        else if (option === "videoStreamTrackConstraints")
        {
            this.srcp.videoStreamTrack.applyConstraints(null).then((value) => {
                this.srcp.log(value);
            }).catch((err) => {
                this.srcp.log(err);
                });
        }
        else if (option === 'cameraDeviceId')
        {
            this.srcp.log(this.cameraDeviceId);
            this.srcp.updateLocalStream({
                video: {
                    advanced: [{
                        facingMode: "environment"
                    }]
                }, audio: true });
        }
    }
    initializeContacts()
    {
        this.contacts = [];
        this.srcp.contacts.forEach((user) => {
            if (!this.srcp.roomMembers[user])
            {
                this.contacts.push({
                    username: user,
                    isSelected: false
                });
            }
        });
    }
    addContacts()
    {
        let requests = [];
        this.contacts.forEach((item) => {
            if (item.isSelected)
            {
                requests.push(item.username);
            }
        });
        if (requests.length !== 0) {
            this.srcp.nativeService.showToast("邀请" + requests + "成功");
            this.srcp.requestPeer(requests);
        }
    }
}
