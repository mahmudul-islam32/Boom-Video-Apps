const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video')
myVideo.muted = true;

var peer = new Peer( undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});

let videoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    videoStream = stream;
    addVideoStream(myVideo, stream);

  peer.on('call', call => {
    call.answer(stream); // Answer the call 
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    });
});

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})




const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video,stream) => {
   video.srcObject = stream;
   video.addEventListener('loadedmetadata', () => {
    video.play();
   })
   videoGrid.append(video);
}

const scrollToBottom = () => {
    let d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = videoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        videoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        videoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = videoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        videoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      videoStream.getVideoTracks()[0].enabled = true;
    }
  }

const setMuteButton = () => {
    const html = ` <i class="fas fa-microphone"></i> <span>Mute</span> `
    document.querySelector('.main_mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = ` <i class="unmute fas fa-microphone-slash"></i> <span>Unmute</span> `
    document.querySelector('.main_mute_button').innerHTML = html;
}



const setStopVideo = () => {
    const html = `<i class="fas fa-video"></i>
    <span>Stop Video</span>`
    document.querySelector('.main_video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `<i class="stop fas fa-video"></i>
    <span>Play Video</span>`
    document.querySelector('.main_video_button').innerHTML = html;
}

let text = $('input')
console.log(text)

$('html').keydown((e) => {
   if(e.which == 13 && text.val().length !== 0){
    console.log(text.val())
    socket.emit('message', text.val());
    text.val('')
   }
})

socket.on('createMessage', message => {
    $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`)
    scrollToBottom()
})