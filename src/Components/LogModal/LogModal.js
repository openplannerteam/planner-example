import React, { Component } from "react";

import { Box } from "@material-ui/core";
import Typist from "react-typist";
import styles from "./LogModal.module.css";

class LogModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { open } = this.props;
    return (
      <React.Fragment>
        {open ? (
          <div>
            <Box className={styles.logModal} p={1}>
              <Typist>
                <h2>Calculating your route...</h2>
              </Typist>
              <Typist>Lorem ipsum dolor sit amet</Typist>
              <Typist>Ut enim ad minim veniam</Typist>
              <Typist>in reprehenderit in voluptate</Typist>

              <Typist>Lorem ipsum dolor sit amet</Typist>
              <Typist>Ut enim ad minim veniam</Typist>
              <Typist>in reprehenderit in voluptate</Typist>

              <Typist>Lorem ipsum dolor sit amet</Typist>
              <Typist>Ut enim ad minim veniam</Typist>
            </Box>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export default LogModal;
