import React, { Component } from "react";

import styles from "./LogSummary.module.css";

class LogSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { show = true, scannedConnections, timeElapsed } = this.props;
    return (
      <React.Fragment>
        {show ? (
          <div className={styles.logSummary}>
            <p>Number of requests : {scannedConnections}</p>
            <p>Elapsed Time : {timeElapsed}s</p>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export default LogSummary;
