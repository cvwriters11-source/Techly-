import type { CareerVoice } from "@/lib/career/store";

const AZURE_VOICES: Record<CareerVoice, string> = {
  woman: "en-ZA-LeahNeural",
  man: "en-ZA-LukeNeural",
};

/** Slightly lower pitch + calm rate for a deeper, more interview-real feel. */
const VOICE_PROSODY: Record<
  CareerVoice,
  { pitch: string; rate: string }
> = {
  woman: { pitch: "-6%", rate: "0.92" },
  man: { pitch: "-10%", rate: "0.9" },
};

export function azureVoiceName(voice: CareerVoice) {
  return AZURE_VOICES[voice];
}

export function isAzureSpeechConfigured() {
  return Boolean(
    process.env.AZURE_SPEECH_KEY?.trim() &&
      process.env.AZURE_SPEECH_REGION?.trim(),
  );
}

export async function synthesizeCareerSpeech(input: {
  text: string;
  voice: CareerVoice;
}): Promise<ArrayBuffer> {
  const key = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim();
  if (!key || !region) {
    throw new Error(
      "Azure Speech is not configured. Add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.",
    );
  }

  const voiceName = azureVoiceName(input.voice);
  const prosody = VOICE_PROSODY[input.voice];
  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-ZA'>
  <voice xml:lang='en-ZA' name='${voiceName}'>
    <prosody pitch='${prosody.pitch}' rate='${prosody.rate}'>
      ${escapeXml(input.text)}
    </prosody>
  </voice>
</speak>`;

  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
        "User-Agent": "TechlyCareerCoach",
      },
      body: ssml,
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail || `Azure Speech failed with status ${response.status}.`,
    );
  }

  return response.arrayBuffer();
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
