import { Box, Container, Fab, Grid } from "@material-ui/core";
import React, { Component } from "react";

import Drawer from "react-drag-drawer";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import JSONPretty from "react-json-pretty";
import JSONPrettyMon from "react-json-pretty/dist/monikai";
import styles from "./LogModal.module.css";

class LogModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { open, onClose, logs, query} = this.props;
    return (
      <Drawer open={open} modalElementClass={styles.logModal}>
        <Container>
          <Box p={1}>
            <Grid container justify="center">
              <Grid item>
                <Fab color="primary" onClick={onClose}>
                  <ExpandMoreIcon />
                </Fab>
              </Grid>
            </Grid>
            <h1>Execution logs</h1>
            <h5>Executed query :</h5>
            <JSONPretty json={query} theme={JSONPrettyMon}></JSONPretty>
            <br />
            <h5>Data fetched :</h5>
            {logs.map((l, index) => (
              <p key={index}>
                <span className={styles.yellow}>[GET]</span>{" "}
                <a href={l.url}>{l.url}</a>{" "}
                <span className={styles.green}>({l.duration}ms)</span>
              </p>
            ))}
            <br />
          </Box>
        </Container>
      </Drawer>
    );
  }
}

export default LogModal;
