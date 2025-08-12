let selectedVoice = null;

export function initVoices() {
  const synth = window.speechSynthesis;

  const loadVoices = () => {
    const voices = synth.getVoices();

    // Log all available voices (only once)
    console.log("Available voices:");
    voices.forEach((v, i) => console.log(`${i + 1}. ${v.name} (${v.lang})`));

    // Prioritized voice selection
    selectedVoice =
      voices.find(v => v.name === "Google US English") ||
      voices.find(v => v.name.includes("Zira")) ||
      voices.find(v => v.name.toLowerCase().includes("female")) ||
      voices.find(v => v.lang === "en-US") ||
      voices[0]; // fallback

    if (selectedVoice) {
      console.log("✅ Voice selected:", selectedVoice.name, selectedVoice.lang);
    } else {
      console.warn("⚠️ No suitable voice found. Using system default.");
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
