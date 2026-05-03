import React, { FunctionComponent } from "react";
import cn from "classnames";

import "./HeaderBox.css";

interface HeaderBoxButton {
  text: string;
  onClick: () => void;
}

interface HeaderBoxProps {
  title: string;
  showArrow?: boolean;
  rightButton?: HeaderBoxButton;
  extraRightButtons?: HeaderBoxButton[];
}

export const HeaderBox: FunctionComponent<HeaderBoxProps> = (props) => {
  const { children, title, rightButton, extraRightButtons, showArrow } = props;

  const buttonEl = rightButton && (
    <div onClick={rightButton.onClick} className="header-box-button">
      {rightButton.text}
    </div>
  );

  const extraButtonsEl = extraRightButtons?.map((b, i) => (
    <div key={i} onClick={b.onClick} className="header-box-button">
      {b.text}
    </div>
  ));

  const arrowClassname = cn(["header-box-arrow", { "show-arrow": showArrow }]);

  return (
    <div className="header-box">
      <div className="header-box-header">
        <span className={arrowClassname} />
        <pre className="header-box-title">{title}</pre>
        <span className="header-box-header-spacer" />
        {extraButtonsEl}
        {buttonEl}
      </div>
      {children && (
        <>
          <div className="header-box-contents">{children}</div>
          <div className="header-box-footer"></div>
        </>
      )}
    </div>
  );
};