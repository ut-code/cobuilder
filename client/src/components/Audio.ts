export default class AudioManager {
  stream?: MediaStream;

  mediaRecorder: MediaRecorder;

  constructor() {
    (async () => {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
    })();
  }

  startRecording() {}

  stopRecording() {}
}
