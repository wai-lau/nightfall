import React from "react";

import "./GuideArrow.css";
import { HeaderBox } from "./HeaderBox";

interface GuideTextProps {
  // Tracked live: a rect captured once goes stale on scroll, board animations,
  // and mobile orientation changes, stranding the label off its target.
  target: Element;
  text: string;
}

const GuideText: React.FunctionComponent<GuideTextProps> = ({ target, text }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const { top, right, height } = target.getBoundingClientRect();
        el.style.top = `${top + height / 2}px`;
        el.style.left = `${right}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 999,
    marginLeft: "1em",
    transform: "translateY(-50%)",
  };

  return (
    <div ref={ref} className="guide-text" style={style}>
      <HeaderBox title={text} showArrow />
    </div>
  );
};

export default GuideText;
