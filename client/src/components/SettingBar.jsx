import React from "react";
import "../styles/toolbar.scss";
import toolState from "../store/toolState";

const SettingBar = () => {
  return (
    <div className="setting_bar">
      <label style={{ margin: "0 10px" }} htmlFor="line_width">
        Line width
      </label>
      <input
        type="number"
        onChange={(e) => toolState.setLineWidth(e.target.value)}
        defaultValue={1}
        min={1}
        max={50}
        id="line_width"
      />
      <label htmlFor="stroke_color" style={{ margin: "0 10px" }}>
        Stroke color
      </label>
      <input type="color" onChange={(e) => toolState.setStrokeColor(e.target.value)} id="stroke_color" />
    </div>
  );
};

export default SettingBar;
