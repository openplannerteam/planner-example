import React, { Component } from "react";

import { Fab } from "@material-ui/core";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import styles from "./ResetButton.module.css";

class ResetButton extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { resetRoute, show = true } = this.props;
    return (
      <React.Fragment>
        {show ? (
          <div className={styles.resetButton}>
            <Fab variant="extended" onClick={() => resetRoute(true)}>
              <RotateLeftIcon className={styles.buttonIcon} />
              Reset
            </Fab>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export default ResetButton;
