let selectedVoice = null;

export function initVoices() {
  const synth = window.speechSynthesis;

  const loadVoices = () => {
    const voices = synth.getVoices();
    selectedVoice = voices.find(v => v.name.includes("Zira")) 
                  || voices.find(v => v.name.toLowerCase().includes("female"));
    
    if (selectedVoice) {
      console.log("Voice selected:", selectedVoice.name);
    } else {
      console.warn("Female voice not found. Using default.");
    }
  };

  if (synth.getVoices().length > 0) {
    loadVoices();
  } else {
    synth.onvoiceschanged = loadVoices;
  }
}

export function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.lang = selectedVoice?.lang || "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}
