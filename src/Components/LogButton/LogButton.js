import React, { Component } from "react";

import { Fab } from "@material-ui/core";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import styles from "./LogButton.module.css";

class LogButton extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { openLogs, isLogOpen } = this.props;
    return (
      <React.Fragment>
        {isLogOpen ? null : (
          <div className={styles.logButton}>
            <Fab color="primary" onClick={openLogs}>
              <KeyboardArrowUpIcon />
            </Fab>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default LogButton;
