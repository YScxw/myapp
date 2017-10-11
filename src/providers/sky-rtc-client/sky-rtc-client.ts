import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { rtc_PeerConnection, rtc_URL, rtc_RTCIceCandidate, rtc_RTCSessionDescription, rtc_getUserMedia} from 'SkyRTC-client'
import { NativeService } from "../nativeservice/NativeService";
/*
  Generated class for the SkyRtcClientProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class SkyRtcClientProvider{
    localMediaStream: MediaStream = null;
    videoStreamTrack: MediaStreamTrack = null;
    audioStreamTrack: MediaStreamTrack = null;
    videoStreamTrackConstraints: MediaTrackConstraints = {};
    audioStreamTrackConstraints: MediaTrackConstraints = {};
    videoDevices = [];
    audioDevices = [];
    room: string = null;
    socket = null;
    peerConnections = {};
    connections: Array<string> = [];
    connected: number = 0;
    roomMembers = {};
    me: string;
    contacts: Array<string> = [];
    iceServer = {
        "iceServers": [{
            "url": "stun:stun.l.google.com:19302"
        }]
    };
    constructor(public nativeService: NativeService, public events: Events) {
        navigator.mediaDevices.enumerateDevices().then((devices) =>
        {
            for (let i = 0; i < devices.length; i++)
            {
                if (devices[i].kind === "videoinput")
                {
                    this.videoDevices.push({ deviceId: devices[i].deviceId, label: devices[i].label || "camera " + (this.videoDevices.length+1) });
                }
                else if (devices[i].kind === "audioinput")
                {
                    this.audioDevices.push({ deviceId: devices[i].deviceId, label: devices[i].label || "microphone " + (this.audioDevices.length + 1) });
                }
            }
            if (this.videoDevices.length)
            {
                this.videoStreamTrackConstraints.deviceId = { exact: this.videoDevices[0].deviceId };
            }
            if (this.audioDevices.length)
            {
                this.audioStreamTrackConstraints.deviceId = { exact: this.audioDevices[0].deviceId };
            }       
        });
        this.videoStreamTrackConstraints.facingMode = { exact: "user" };
        this.videoStreamTrackConstraints.frameRate = { exact:20 };
        this.videoStreamTrackConstraints.advanced = [{ width: 720, height: 960 }, { width: 480, height: 640 }, { width: 1080, height: 1440 }];
        this.videoStreamTrackConstraints.aspectRatio = { min: 1.33333333, max: 1.33333334 };
        this.audioStreamTrackConstraints.volume = { exact: 0.5 };
    }
    sendData(eventName, data) {
        this.socket.send(JSON.stringify({
            "eventName": eventName,
            "data": data
        }));
    }
    connect(server,username)
    {
        this.socket = new WebSocket(server);
        this.socket.onopen = () =>
        {
            this.sendData("__login", { "username": username });
            this.events.subscribe("__login", (data) =>
            {
                if (!data.OK)
                {
                    alert(data.err);
                    this.disconnect();
                }
                else
                {
                    this.me = username;
                    this.events.subscribe("__users", (data) => {
                        this.contacts = [];
                        data.contacts.forEach((username) =>{
                            if(username!==this.me)
                            {
                                this.contacts.push(username);
                            }
                        });
                        this.contacts = data.contacts;
                    });
                    this.events.subscribe("__requestPeer", (info) => {
                        this.nativeService.alertCtrl.create({
                            title: '用户' + info.request+'邀请您视频通话',
                            message: "是否加入？",
                            buttons: [
                                {
                                    text: '是',
                                    handler: data => {
                                        this.nativeService.modalView = this.nativeService.modalCtrl.create('VideogroupPage', { room: this.room });
                                        this.nativeService.modalView.present();
                                    }
                                },
                                {
                                    text: '否',
                                    handler: data => {
                                    }
                                }
                            ]
                        }).present();
                    });
                }
                this.events.unsubscribe("__login");
             });
        };

        this.socket.onmessage = this.onMessage;
        this.socket.onerror = (error) =>
        {
            this.log("socket_error:" + error);
        };
        this.socket.onclose = (data) =>
        {
            this.events.unsubscribe("__users");
            this.events.unsubscribe("__requestPeer");
            this.clearRommInfo();
            this.log('socket_closed');
        };
    }
    disconnect() {
        this.socket.close();
    }
    onMessage = (message) =>
    {
        let json = JSON.parse(message.data);
        if (json.eventName)
        {
            this.events.publish(json.eventName, json.data);
        }
        else
        {
            this.log("error message:" + json);
        }
    }
    clearRommInfo()
    {
        this.events.unsubscribe("__answer");
        this.events.unsubscribe("__IMOK");
        this.events.unsubscribe("__IMOK2");
        this.events.unsubscribe("__ice_candidate");
        this.events.unsubscribe("__removeMember");
        this.events.unsubscribe("pc_add_stream");
        this.events.unsubscribe("pc_remove_stream");

        this.closeLocalStream();
        this.closePeerConnections();

        this.peerConnections = {};
        this.connections = [];
        this.connected = 0;
        this.roomMembers = {};
        this.room = null;
    }
    leaveRoom() {
        this.sendData("__leaveRoom", { "room": this.room });
        this.clearRommInfo();
    }
    joinRoom(room)
    {
        this.room = room;
        this.sendData("__joinRoom", { "room": room });
        this.events.subscribe("__joinRoom", (data) => {
            this.connections = [];
            this.roomMembers = {};
            this.connected = 0;
            this.roomMembers[this.me] = this.roomMembers[this.me] || "";
            this.roomMembers[this.me] = data.you;
            let i;
            for (i = 0; i < data.connections.length; i++)
            {
                this.connections.push(data.connections[i].socketId);
                this.roomMembers[data.connections[i].username] = this.roomMembers[data.connections[i].username] || "";
                this.roomMembers[data.connections[i].username] = data.connections[i].socketId;
            }
            
            this.createPeerConnections();
            this.updateLocalStream({
                video: this.videoStreamTrackConstraints, audio: this.audioStreamTrackConstraints
            });
            this.events.subscribe("__IMOK", (data) => {
                if (this.connections.indexOf(data.socketId) === -1) {
                    this.connections.push(data.socketId);
                    this.connected++;
                    this.roomMembers[data.username] = this.roomMembers[data.username] || "";
                    this.roomMembers[data.username] = data.socketId;
                    this.peerConnections[data.socketId] = this.createPeerConnection(data.socketId);
                    if (this.localMediaStream) {
                        this.peerConnections[data.socketId].addStream(this.localMediaStream);
                    }  
                }   
                this.send2Others("__IMOK2", { data: { socketId: this.roomMembers[this.me] }, socketIds: [data.socketId] });
                this.events.subscribe("__offer", (data) => {
                    this.receiveOffer(data.socketId, data.sdp);
                    this.events.unsubscribe("__offer");
                });
            });
            this.events.subscribe("__IMOK2", (data) => {
                this.sendOffer(data.socketId);
                if (this.connected === this.connections.length)
                {
                    return;
                }
                if (this.connections.indexOf(data.socketId) !== -1) {
                    this.connected++;
                }
            });
            this.events.subscribe("__answer", (data) => {
                this.receiveAnswer(data.socketId, data.sdp);

            });
            this.events.subscribe("__ice_candidate", (data) => {
                let candidate = new rtc_RTCIceCandidate(data);
                this.peerConnections[data.socketId].addIceCandidate(candidate);
            });
            this.events.subscribe("__removeMember", (data) => {
                let index = this.connections.indexOf(data.socketId);
                if (index !== -1) {
                    this.connections.splice(index, 1);
                    this.connected -= 1;
                    delete this.roomMembers[data.username];
                    this.closePeerConnection(this.peerConnections[data.socketId]);
                    delete this.peerConnections[data.socketId];
                    this.events.publish("pc_remove_stream", data.username);
                }
            });
            this.events.unsubscribe("__joinRoom");
        });
    }
    closeLocalStream()
    {
        if (this.localMediaStream)
        {
            if (this.videoStreamTrack)
            {
                this.videoStreamTrack.stop();
                this.videoStreamTrack = null;
            }
            if (this.audioStreamTrack) {
                this.audioStreamTrack.stop();
                this.audioStreamTrack = null;
            }
            this.localMediaStream=null;
        }
    }
    closePeerConnections()
    {
        var connection;
        for (connection in this.peerConnections) {
            this.closePeerConnection(this.peerConnections[connection]);
        }
    }
    updateLocalStream(options)
    {
        rtc_getUserMedia(options).then((stream) => {
            this.closeLocalStream();
            this.localMediaStream = stream;
            this.videoStreamTrack = this.localMediaStream.getVideoTracks()[0];
            this.audioStreamTrack = this.localMediaStream.getAudioTracks()[0];
            this.events.publish("pc_add_stream", this.localMediaStream, this.me);
            this.addStreams();
            this.send2Others("__IMOK", { data: { username: this.me, socketId: this.roomMembers[this.me] }, socketIds: this.connections });
        }).catch((err) => {
            alert("Sorry,您的设备暂不支持视频通话");
            this.log("stream_create_error:" + err);
        });
    }
    requestPeer(usernames) 
    {
        this.send2Others("__requestPeer", { data: { request: this.me, room: this.room }, usernames: usernames });
    }
    send2Others(event,data)
    {
        this.sendData("__send2Others", {event:event,data:data});
    }

    addStreams() {
        let connection;
        for (connection in this.peerConnections) {
            this.peerConnections[connection].addStream(this.localMediaStream);
        }
    }

    attachStream (stream, domId)
    {
        let element = document.getElementById(domId);
        if (stream && element)
        {
            element.setAttribute("src", rtc_URL.createObjectURL(stream));
        }
    };

    sendOffer(id)
    {
        let pcCreateOfferCbGen =(pc, socketId)=>{
                return (session_desc)=>{
                    pc.setLocalDescription(session_desc);
                    this.send2Others("__offer", { data: { socketId: this.roomMembers[this.me], sdp: session_desc }, socketIds: [socketId] });
                };
            },
            pcCreateOfferErrorCb = (error)=>{
                this.log(error);
            }, pc;
        pc = this.peerConnections[id];
        if (pc)
        {
            pc.createOffer(pcCreateOfferCbGen(pc, id), pcCreateOfferErrorCb);
        }      
    }
    receiveOffer(socketId, sdp)
    {
        let pc = this.peerConnections[socketId];
        pc.setRemoteDescription(new rtc_RTCSessionDescription(sdp)).catch(err => this.log(err));;
        pc.createAnswer((session_desc)=>{
            pc.setLocalDescription(session_desc);
            this.send2Others("__answer", { socketIds: [socketId], data: { socketId: this.roomMembers[this.me], sdp: session_desc } });
        }, function (error) {
            this.log(error);
        });
    }
    receiveAnswer(socketId, sdp)
    {
        let pc = this.peerConnections[socketId];
        pc.setRemoteDescription(new rtc_RTCSessionDescription(sdp)).catch(err => this.log(err));
    }
    createPeerConnections() {
        let i, m;
        for (i = 0, m = this.connections.length; i < m; i++) {
            this.peerConnections[this.connections[i]] = this.createPeerConnection(this.connections[i]);      
        }
    }
    getNameById(socketId)
    {
        let member;
        for (member in this.roomMembers)
        {
            if (this.roomMembers[member] === socketId)
            {
                return member;
            }
        }
        return null;
    }
    createPeerConnection(socketId)
    {
        let pc = new rtc_PeerConnection(this.iceServer);
        pc.onicecandidate = (evt) =>
        {
            if (evt.candidate)
            {
                this.send2Others("__ice_candidate", {
                    data:
                    {
                         label: evt.candidate.sdpMLineIndex,
                         candidate: evt.candidate.candidate,
                         socketId: this.roomMembers[this.me]
                    }
                    ,
                    socketIds: [socketId]
                });
            }
        }
        pc.onaddstream = (evt) =>
        {
            this.events.publish('pc_add_stream', evt.stream, this.getNameById(socketId));
        };
        return pc;
    }
    closePeerConnection(pc)
    {
        if (!pc)
            return;
        pc.close();
    }
    log(message)
    {
        console.log(new Date() + " : " + message);
    }
}
