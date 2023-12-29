const synth = window.speechSynthesis;
let voices = [];
let mediaRecorder;
let recordedChunks = [];

function populateVoiceList() {
  voices = synth.getVoices();
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speakText() {
  const textInput = document.getElementById('textToSpeak').value;
  const selectedVoice = document.getElementById('voice').value;
  const speed = document.getElementById('speed').value;

  const utterance = new SpeechSynthesisUtterance(textInput);
  for (let i = 0; i < voices.length; i++) {
    if (voices[i].lang === selectedVoice) {
      utterance.voice = voices[i];
      break;
    }
  }

  utterance.rate = parseFloat(speed);
  synth.speak(utterance);
}

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = event => {
        recordedChunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks, { type: 'audio/mpeg-3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.controls = true;
        document.body.appendChild(audio);
        recordedChunks = [];
        document.querySelector('.delete-btn').disabled = false;
      };
      mediaRecorder.start();
    })
    .catch(err => console.error('Error accessing microphone:', err));
}

function deleteRecording() {
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => audio.remove());
  document.querySelector('.delete-btn').disabled = true;
}

function resetAll() {
  synth.cancel();
  deleteRecording();
}

// Optional: Stop recording when the window/tab is closed
window.addEventListener('beforeunload', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
});
