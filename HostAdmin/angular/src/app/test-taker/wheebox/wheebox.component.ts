import { Component, OnInit, Renderer2 } from '@angular/core';
import { Constants } from '@app/models/constants';
import { environment as en } from "environments/environment";

declare function connectionwsGet1(time): any;
declare function startProctoringThread(interval, facerec_required, objectdetction_required, token, userdetail): any;
declare function stopProctoringThread(): any;
declare function showchatbox(): any;
declare function hidechatbox(): any;
declare function checkOverallProctoringStatus(): any;
declare function initializeUdetail(ud): any;
declare function clearScreenThreadinterval(): any;


@Component({
  selector: 'app-wheebox',
  templateUrl: './wheebox.component.html',
  styleUrls: ['./wheebox.component.scss']
})
export class WheeboxComponent implements OnInit {

  fname: string;
  roomId: string;
  key_sno: string;
  constants = Constants;
  isVideoRecording: boolean = false;
  wheeboxAppUrl: string;
  wheeboxChatUrl: string;
  wheeboxInstance: string;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.wheeboxAppUrl = en.wheeboxAppURL;
    this.wheeboxChatUrl = en.wheeboxChatURL;
    this.wheeboxInstance = en.wheeboxInstance;
    if (en.production) {
      this.loadJsScript("assets/wheebox/screencapture.js");
      this.loadJsScript("assets/wheebox/userChat.min.js");
      this.loadJsScript("assets/wheebox/paasscript1.min.js");
      this.loadJsScript("assets/wheebox/detectnoise.min.js");
      this.loadJsScript("assets/wheebox/paasscript.min.js");
      this.loadJsScript("assets/wheebox/paasscript4.min.js");
    }
    else {
      this.loadJsScript("assets/wheebox/uat/screencapture.js");
      this.loadJsScript("assets/wheebox/uat/userChat.min.js");
      this.loadJsScript("assets/wheebox/uat/paasscript1.min.js");
      this.loadJsScript("assets/wheebox/uat/detectnoise.min.js");
      this.loadJsScript("assets/wheebox/uat/paasscript.min.js");
      this.loadJsScript("assets/wheebox/uat/paasscript4.min.js");
    }
  }

  public loadJsScript(src: string): HTMLScriptElement {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    this.renderer.appendChild(window.document.body, script);
    return script;
  }

  startClientLiveVideoStreamingWithUser(udetail: { student_unique_id: string, student_name: string, attemptId: string, recordsession: string },
    token: string, isFaceCheckRequired: boolean, isObjectDetectionRequired: boolean) {
    this.fname = udetail.student_name;
    this.roomId = en.wheeboxInstance + udetail.attemptId;
    this.key_sno = udetail.attemptId;
    initializeUdetail(udetail);
    if (udetail.recordsession === "enabled") {
      this.isVideoRecording = true;
    }
    setTimeout(() => {
      document.getElementById("open-room").click();
    });
    connectionwsGet1(3000);
    startProctoringThread(60000, isFaceCheckRequired, isObjectDetectionRequired, token, udetail);
  }

  stopTestProctoring() {
    try {
      stopProctoringThread();
    }
    catch (error) { }
    try {
      clearScreenThreadinterval();
    }
    catch (error) { }
  }

  showchatboxFromCompenent() {
    showchatbox();
  }

  hideChatBoxFromComponent() {
    hidechatbox();
  }

  showCameraIcon() {
    document.getElementById("WBcameraCercleBox").style.display = "block";
    document.getElementById("divChat").style.display = "block";
  }

  hideCameraIcon() {
    document.getElementById("divChat").style.display = "none";
    document.getElementById("WBcameraCercleBox").style.display = "none";
  }

}
