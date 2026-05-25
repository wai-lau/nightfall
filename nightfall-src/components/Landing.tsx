import React, { CSSProperties } from "react";
import cn from "classnames";

import "./Landing.css";
import TitleButton from "./TitleButton";

interface LandingProps {
  onClose: () => void;
  duration: number;
  ready: boolean;
}

interface LandingState {
  isClosing: boolean;
}

class Landing extends React.Component<LandingProps, LandingState> {
  constructor(props: LandingProps) {
    super(props);
    this.state = {
      isClosing: false,
    };
  }

  onClose = () => {
    if (!this.props.ready) return;
    this.setState({
      isClosing: true,
    });
    this.props.onClose();
  };

  render() {
    const { ready } = this.props;
    const landingClassname = cn(["landing", this.state.isClosing ? "fade-out" : "fade-in"]);
    const landingStyle: CSSProperties = {
      animationDuration: this.props.duration + "ms",
    };
    const startStyle: CSSProperties = {
      opacity: ready ? 1 : 0.35,
      cursor: ready ? "pointer" : "default",
    };
    return (
      <div className={landingClassname} style={landingStyle}>
        <div className="landing-text">
          <h1 className="landing-title">Nightfall</h1>
          <h1 className="landing-title landing-title-small">Incident</h1>
        </div>
        <TitleButton className="landing-button" onClick={this.onClose} style={startStyle}>
          Start
        </TitleButton>
      </div>
    );
  }
}
export default Landing;