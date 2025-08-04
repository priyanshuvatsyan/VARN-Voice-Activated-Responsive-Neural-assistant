import axios from 'axios';

const API_KEY = 'sk_f6a04b79423cd1c6fea3d6991752692f92f8b89d1daa404e';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; //  voice ID


export async function speakWithElevenLabs(text) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
      }
    );

    // Convert response to Blob and play
    const blob = new Blob([response.data], { type: 'audio/mpeg' });
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  } catch (err) {
    console.error('ElevenLabs TTS error:', err);
  }
}