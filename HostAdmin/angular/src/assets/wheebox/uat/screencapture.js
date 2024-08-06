'use strict'; 
var displayMediaOptions = {
  video: {
    cursor: "always",
    displaySurface: "monitor",
    logicalSurface: false
	
  },
  audio: false
};

async function startCapture(displayMediaOptions) {
  let captureStream = null;

  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
   
  } catch(err) {
   // console.error("Error: " + err);
  }
  
  return captureStream;
}


function startCapture(displayMediaOptions) {
 let captureStream = null;
 return navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
    .catch(err => { console.error("Error:" + err); return null; });
}

const gdmOptions = {
  video: true,
  audio: true
}
 
const videoElem = document.getElementById("videoScreen");
const startElem = document.getElementById("startScreenShare");
const stopElem = document.getElementById("stop");

// Set event listeners for the start and stop buttons
if(document.getElementById("startScreenShare")){
	
startElem.addEventListener("click", function(evt) {
  startCapture();
}, false);
}
 if(document.getElementById("stop")){
	
stopElem.addEventListener("click", function(evt) {
	 
  stopCapture();
  
}, false);
}

function checkEnviorment(){ 
	screenSharingCheck=true;
	hidealls('please allow the permission..');
	document.getElementById("startScreenShare").click();
}    
   
async function startCapture() {
    try {
    videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    const videoTrack = videoElem.srcObject.getVideoTracks()[0];
	if('monitor' ==videoTrack.getSettings().displaySurface)
	{
		screenSharingCheck=true;
		console.log('entire screen is selected');
	}
	else
	{	
    console.log('entire screen is not selected');
    entireScreenShare(udetail)
    setTimeout(()=>{
      startCapture();
    },3000);
		screenSharingCheck=false;
		hidealls("To start the test, 'Please select <strong>Your Entire Screen<strong>'. Click on 'Try Again'.<br/> <a href='#' style='font-weight: bold;color: white;font-size: 15px;padding-top: 10px;' onclick='checkEnviorment()' align='center'>Try Again</a>");
    
	}
	
    dumpOptionsInfo();
  } catch(err) {
    console.error("Error: " + err);
    screenSharingCheck=false;
	hidealls("To start the test, 'Please select <strong>Your Entire Screen<strong>'. Click on 'Try Again'.<br/> <a href='#' style='font-weight: bold;color: white;font-size: 15px;padding-top: 10px;' onclick='checkEnviorment()' align='center'>Try Again</a>");
  stopSharingViolation(udetail);
 }
}



function stopCapture(evt) {
  let tracks = videoElem.srcObject.getTracks();
  console.log("You Stop shareing button click");
  tracks.forEach(track => track.stop());
  videoElem.srcObject = null;
 
}

function dumpOptionsInfo() {	 
	
  	const videoTrack = videoElem.srcObject.getVideoTracks()[0];
  	
  	 
	videoTrack.addEventListener('ended', (event) => {
		  console.log('Screen Sharing stopped'+(new Date()));
      stopSharingViolation(udetail);
		  screenSharingCheck=false;allowcheeting = false;
		  hidealls("To start the test, 'Enable Screen Sharing'. Click on 'Try Again'.<br/> <a href='#' style='font-weight: bold;color: white;font-size: 15px;padding-top: 10px;' onclick='checkEnviorment()' align='center'>Try Again</a> ");	 
	});	
}
  var streamingCheck=null;
  function hidealls(msg) { 
	 console.log(msg);
     }

  var screenSharingCheck=true;

function captureScreenImage(){
		try{
			var frame = captureVideoFrame('videoScreen', 'jpeg');
				  streamingCheck=frame.dataUri;	
				  if(frame.dataUri=="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCABkAMgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z"){
					  screenSharingCheck=false;
					  //hidealls("To start the test, 'Enable Screen Sharing'. Click on 'Try Again'.<br/> <a href='#' style='font-weight: bold;color: white;font-size: 15px;padding-top: 10px;' onclick='checkEnviorment()' align='center'>Try Again</a> ");
					 return 'Enable Screen Sharing';
				  }
				  else
				  {					
				  console.log('your image data on Sucess: \t '+ streamingCheck);
				  return streamingCheck;	
				  }
		}catch (e) {
			console.log(e);  
		}
	}
	

/* $(function(){
    window['hasFocus'] = false;
    $(window)
        .bind('focus', function(ev){
            window.hasFocus = true;
        })
        .bind('blur', function(ev){
            window.hasFocus = false;
        })
        .trigger('focus'); 
}); */

  
//capture-video-frame.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.captureVideoFrame = factory();
    }
}(this, function () {
    return function captureVideoFrame(video, format) {
        if (typeof video === 'string') {
            video = document.getElementById(video);
        }

        format = format || 'jpeg';

        if (!video || (format !== 'png' && format !== 'jpeg')) {
            return false; 
        }
        var canvas = document.createElement("CANVAS");
             canvas.width = 200;
     	     canvas.height = 100;
     	     canvas.getContext('2d').drawImage(video, 0, 0,200,100);
  
        var dataUri = canvas.toDataURL('image/' + format);
        var data = dataUri.split(',')[1];
        var mimeType = dataUri.split(';')[0].slice(5)
        var bytes = window.atob(data);
        var buf = new ArrayBuffer(bytes.length);
        var arr = new Uint8Array(buf);
        for (var i = 0; i < bytes.length; i++) {
            arr[i] = bytes.charCodeAt(i);
        }
        var blob = new Blob([ arr ], { type: mimeType });
        return { blob: blob, dataUri: dataUri, format: format };
    };
})); 