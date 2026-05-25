import React from "react";

import { AudioContext } from "../util/AudioContext";
import * as AudioSources from "../audio/audioSources";

interface AudioLoaderProps {
  onLoad: () => void;
  onProgress?: (loaded: number, total: number) => void;
}
interface AudioLoaderState {
  hasReceivedContext: boolean;
}
export default class AudioLoader extends React.Component<AudioLoaderProps, AudioLoaderState> {
  static contextType = AudioContext;
  constructor(props: AudioLoaderProps) {
    super(props);
    this.state = {
      hasReceivedContext: false,
    };
  }

  componentDidMount() {
    this.loadAudio();
  }

  async loadAudio() {
    const sources = Object.values(AudioSources);
    const total = sources.length;
    let loaded = 0;
    this.props.onProgress?.(0, total);
    const loadPromises = sources.map((source) =>
      this.context.player
        .loadAudio(source)
        .catch((e: unknown) => {
          console.warn("Failed to load audio:", source.name, e);
        })
        .finally(() => {
          loaded++;
          this.props.onProgress?.(loaded, total);
        })
    );
    await Promise.all(loadPromises);
    this.props.onLoad();
  }

  render() {
    return <div></div>;
  }
}