import { Box, Container, Fab, Grid } from "@material-ui/core";
import React, { Component } from "react";

import Drawer from "react-drag-drawer";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typist from "react-typist";
import styles from "./LogModal.module.css";

class LogModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { open, calculating, onClose } = this.props;
    return (
      <Drawer open={open} modalElementClass={styles.logModal}>
        <Container>
          <Box p={1}>
            <Grid container justify="center">
              <Grid item>
                <Fab color="primary" onClick={onClose} disabled={calculating}>
                  <ExpandMoreIcon />
                </Fab>
              </Grid>
            </Grid>
            <h1>Execution logs</h1>
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
        </Container>
      </Drawer>
    );
  }
}

export default LogModal;
