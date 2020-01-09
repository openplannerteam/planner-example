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
    const { openLogs, show } = this.props;
    return (
      <React.Fragment>
        {show ? (
          <div className={styles.logButton}>
            <Fab color="primary" onClick={openLogs}>
              <KeyboardArrowUpIcon />
            </Fab>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export default LogButton;
