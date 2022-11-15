import * as React from "react";
import * as ReactDOM from "react-dom";

import { SuccessfulFSLogin } from "./pages/SuccessfulFSLogin";
import "./style.css";
var mountNode = document.getElementById("popup");
ReactDOM.render(<SuccessfulFSLogin />, mountNode);
