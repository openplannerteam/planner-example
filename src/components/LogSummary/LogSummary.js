import { Box, Grid } from "@material-ui/core";
import React, { Component } from "react";

import ImportExportIcon from "@material-ui/icons/ImportExport";
import LinearScaleIcon from "@material-ui/icons/LinearScale";
import styles from "./LogSummary.module.css";

class LogSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { show = true, scannedConnections, scannedDistance } = this.props;
    return (
      <React.Fragment>
        {show ? (
          <div className={styles.logSummary}>
            <Grid container justify="space-around">
              <Grid item>
                <Grid container>
                  <Grid item>
                    <Box mt={1.5}>
                      <ImportExportIcon></ImportExportIcon>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Box mt={2}>{scannedConnections}</Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container>
                  <Grid item>
                    <Box mt={1.5}>
                      <LinearScaleIcon></LinearScaleIcon>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Box mt={2}>{scannedDistance}km</Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export default LogSummary;
