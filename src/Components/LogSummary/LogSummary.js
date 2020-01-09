import React, { Component } from "react";

import styles from "./LogSummary.module.css";

class LogSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { show } = this.props;
    return (
      <React.Fragment>
        {!show ? (
          <div className={styles.logSummary}>
            <p>Test</p>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export default LogSummary;
