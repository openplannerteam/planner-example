import "./index.css";

import App from "./App";
import React from "react";
import ReactDOM from "react-dom";

require("babel-core/register");
require("babel-polyfill");

ReactDOM.render(<App></App>, document.getElementById("root"));
