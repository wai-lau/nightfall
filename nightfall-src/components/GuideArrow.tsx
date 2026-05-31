import React from "react";

import "./GuideArrow.css";

interface GuideArrowProps {
  // The element the arrow points at. We track its live position every frame
  // (rect captured once goes stale on scroll, board animations, and mobile
  // orientation changes, leaving the arrow pointing at empty space).
  target: Element;
}

const ARROW_SIZE = 80;

const GuideArrow: React.FunctionComponent<GuideArrowProps> = ({ target }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const { top, right, height } = target.getBoundingClientRect();
        el.style.top = `${top - (ARROW_SIZE - height) / 2}px`;
        el.style.left = `${right}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div
      ref={ref}
      className="highlight-rect"
      style={{ height: ARROW_SIZE, width: ARROW_SIZE }}
    />
  );
};

export default GuideArrow;
