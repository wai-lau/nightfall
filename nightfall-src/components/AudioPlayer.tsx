import { IAudioPlayer, IPlayingAudio, IAudioSource } from "../types";
import PComponent from "../util/PComponent";

interface AudioPlayerProps {
  onReady: (player: IAudioPlayer) => void;
  muted?: boolean;
}

interface AudioPlayerState {
  audios: IPlayingAudio[];
}

const AudioContext = (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext || window.AudioContext;

declare const AUDIO_BASE_URL: string;

// Should be the type of AudioBufferSourceNode.buffer
type DecodedBuffer = AudioBuffer;

class AudioPlayer extends PComponent<AudioPlayerProps, AudioPlayerState> implements IAudioPlayer {
  audioCtx = new AudioContext();
  ID_MONOTONIC: number = 0;
  interruptedIDs: IPlayingAudio["id"][] = [];
  buffers: Record<IAudioSource["name"], DecodedBuffer> = {};
  gainNodes: Record<IPlayingAudio["id"], GainNode> = {};

  constructor(props: AudioPlayerProps) {
    super(props);
    this.state = {
      audios: [],
    };
  }

  getID = () => this.ID_MONOTONIC++;

  silentEl: HTMLAudioElement | null = null;

  // iOS mutes the Web Audio API under the Ring/Silent switch, and the context
  // starts suspended until a user gesture. On the first gesture, resume the
  // context and loop a silent media element so the page's audio session becomes
  // "playback" -- which the switch does NOT mute, so game audio plays in silent
  // mode / DnD too. (Same approach as the /hosaka TTS page in exec-fn.)
  unlockAudio = () => {
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();
    if (!this.silentEl) {
      this.silentEl = new Audio(`${AUDIO_BASE_URL}/silence.wav`);
      this.silentEl.loop = true;
    }
    this.silentEl.play().catch(() => {
      /* no gesture / unsupported -- audio still works with the switch off */
    });
    // 1-sample blip through the destination: the iOS WebAudio unlock kick.
    const blip = this.audioCtx.createBufferSource();
    blip.buffer = this.audioCtx.createBuffer(1, 1, this.audioCtx.sampleRate);
    blip.connect(this.audioCtx.destination);
    blip.start(0);
  };

  componentDidMount() {
    this.props.onReady(this as IAudioPlayer);
    const once = () => {
      this.unlockAudio();
      ["pointerdown", "touchend", "keydown"].forEach((e) =>
        document.removeEventListener(e, once)
      );
    };
    ["pointerdown", "touchend", "keydown"].forEach((e) =>
      document.addEventListener(e, once, { passive: true })
    );
  }

  loadAudio = async (source: IAudioSource) => {
    const { srcUrl, name } = source;
    if (this.buffers[name]) {
      return true;
    }
    const res = await fetch(srcUrl);
    const arrayBuffer = await res.arrayBuffer();
    const data = await new Promise((resolve, reject) => {
      this.audioCtx.decodeAudioData(arrayBuffer, resolve, reject);
    });
    this.buffers[name] = data as AudioBuffer;
    return true;
  };

  playAudio = async (
    source: IAudioSource,
    options: { loop?: boolean; waitForEnd?: boolean } = {}
  ) => {
    // TODO
    const buffer = this.buffers[source.name];
    if (!buffer) {
      throw new Error("Could not play unloaded audio " + source.name);
    }
    if (source.solo) {
      this.state.audios.forEach((audio) => {
        try {
          this.interruptedIDs.push(audio.id);
          if (this.gainNodes[audio.id]) {
            this.gainNodes[audio.id].disconnect();
            delete this.gainNodes[audio.id];
          }
          audio.node.stop();
        } catch {
          // TODO: figure out how to check if stop will actually work - then won't need to catch
        }
      });
    }
    const bufferSource = this.audioCtx.createBufferSource();
    bufferSource.buffer = buffer;

    const id = source.name + "-" + this.getID();

    if (source.volume !== undefined) {
      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(source.volume, this.audioCtx.currentTime);
      bufferSource.connect(gainNode).connect(this.audioCtx.destination);
      this.gainNodes[id] = gainNode;
    } else {
      bufferSource.connect(this.audioCtx.destination);
    }

    if (options.loop) {
      bufferSource.loop = true;
    }
    await this.setStateP((state) => ({
      audios: [...state.audios, { node: bufferSource, id, source }],
    }));
    const p = new Promise<boolean>((resolve) => {
      bufferSource.addEventListener("ended", this.createOnEnd(id, resolve));
    });
    bufferSource.start(0, source.offset || 0);
    return options.waitForEnd ? p : true;
  };

  createOnEnd = (id: IPlayingAudio["id"], cb: (wasInterrupted: boolean) => void) => async () => {
    cb(!this.interruptedIDs.includes(id));
    await this.setStateP((state) => ({
      audios: [...state.audios.filter((a) => a.id !== id)],
    }));
  };

  render() {
    return null;
  }
}

export default AudioPlayer;