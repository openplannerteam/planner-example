import React, { Component } from "react";

import styles from "./LogSummary.module.css";

class LogSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { show, scannedConnections} = this.props;
    return (
      <React.Fragment>
        {show ? (
          <div className={styles.logSummary}>
            <p>Total scanned connections : {scannedConnections}</p>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export default LogSummary;
