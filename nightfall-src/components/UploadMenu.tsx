import React from "react";
import cn from "classnames";

import { AudioContext, IAudioContext } from "../util/AudioContext";
import * as AudioSources from "../audio/audioSources";
import { IProgram } from "../types";
import { buildUploadEntries, groupUploadEntries, MISC_GROUP } from "./uploadEntries";

import "./UploadMenu.css";

interface UploadMenuProps {
  programs: IProgram[];
  selectedIndexes?: number[];
  onSelectProgram: (i: number) => void;
  keyboardHighlightIndex?: number;
}

interface UploadMenuState {
  // TODO: counts?
}

export default class UploadMenu extends React.Component<UploadMenuProps, UploadMenuState> {
  static contextType = AudioContext;
  static scrollSpeed = 6;

  audioContext: IAudioContext;
  menuItemsRef: React.RefObject<HTMLDivElement>;
  scrollDirection: "UP" | "DOWN" | null;

  constructor(props: UploadMenuProps) {
    super(props);
    this.menuItemsRef = React.createRef<HTMLDivElement>();
    this.scrollDirection = null;
    this.audioContext = this.context;
  }

  componentDidMount = () => {
    this.audioContext = this.context;
  };

  renderProgramEntries = () => {
    const { programs, onSelectProgram, selectedIndexes = [], keyboardHighlightIndex } = this.props;
    const groups = groupUploadEntries(buildUploadEntries(programs, selectedIndexes));
    return groups.map((group) => (
      <div
        className={cn(["ul-group", { "ul-group-misc": group.key === MISC_GROUP }])}
        key={group.key}
        style={group.key === MISC_GROUP ? undefined : { borderColor: group.color }}
      >
        {group.entries.map(({ entry, flatIndex }) => {
          const { program, filteredIndexes } = entry;
          const available = filteredIndexes.length;
          const onClick = available
            ? async () => {
                await this.audioContext.player.playAudio(AudioSources.UploadProgram);
                onSelectProgram(filteredIndexes[0]);
              }
            : () => {};
          const className = cn([
            "ul-cell",
            { clickable: !!available },
            { "ul-cell-empty": !available },
            { "keyboard-highlight": flatIndex === keyboardHighlightIndex },
          ]);
          return (
            <div className={className} onClick={onClick} key={program.id} title={program.name} data-name={program.name}>
              <div className="ul-cell-icon-box">
                <div className="ul-cell-shadow" style={{ backgroundColor: program.color }} />
                <img className="ul-cell-icon" src={program.iconImageFile} alt={program.name} />
              </div>
              <span className="ul-cell-count">x{available}</span>
            </div>
          );
        })}
      </div>
    ));
  };

  createOnScroll = (direction: "UP" | "DOWN") => () => {
    window.addEventListener("mouseup", this.endScroll);
    window.addEventListener("touchend", this.endScroll);
    this.scrollDirection = direction;
    this.updateScroll();
  };

  endScroll = () => {
    this.scrollDirection = null;
  };

  updateScroll = async () => {
    if (this.scrollDirection === null) {
      return;
    }
    const itemsEl = this.menuItemsRef.current;
    if (!itemsEl) {
      throw new Error("No ref");
    }
    if (this.scrollDirection === "UP") {
      itemsEl.scrollBy({ top: -1 * UploadMenu.scrollSpeed });
    } else if (this.scrollDirection === "DOWN") {
      itemsEl.scrollBy({ top: UploadMenu.scrollSpeed });
    }
    requestAnimationFrame(this.updateScroll);
  };

  render() {
    // TODO: UI
    return (
      <div className="ul-menu">
        <div className="ul-menu-items" ref={this.menuItemsRef}>
          {this.renderProgramEntries()}
        </div>
        <div className="ul-menu-scroll">
          <div className="ul-menu-scroll-up" onMouseDown={this.createOnScroll("UP")}></div>
          <div className="ul-menu-scroll-down" onMouseDown={this.createOnScroll("DOWN")}></div>
        </div>
      </div>
    );
  }
}