import { Card, CardContent, CircularProgress, Grid } from "@material-ui/core";
import React, { Component } from "react";

import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import TrainIcon from "@material-ui/icons/Train";
import styles from "./ResultBox.module.css";

class ResultBox extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { route, calculating, finished } = this.props;
    return (
      <Card className={styles.bottomleft}>
        {calculating ? (
          <CardContent>
            <CircularProgress></CircularProgress>
          </CardContent>
        ) : route ? (
          <CardContent>
            {route.legs.map((leg, index) => {
              const firstStep = leg.steps[0];
              const lastStep = leg.steps[leg.steps.length - 1];
              const duration = leg.steps.map(s=>s.duration.average).reduce((a, b)=>a+b, 0);
              return (
                <Grid container key={index}>
                  <Grid item xs={1}>
                    <p>
                      {leg.travelMode === "walking" ? (
                        <DirectionsWalkIcon />
                      ) : leg.travelMode === "train" ? (
                        <TrainIcon />
                      ) : leg.travelMode === "profile" ? (
                        <DriveEtaIcon />
                      ) : null}
                    </p>
                  </Grid>
                  <Grid item xs={11}>
                    <ul style={{ listStyleType: "none" }}>
                      <li>
                        Duration : {(duration / 60000).toFixed(1)}{" "}
                        minutes
                      </li>
                      <li>
                        Start :{" "}
                        {firstStep.startLocation.name
                          ? firstStep.startLocation.name
                          : firstStep.startLocation.latitude.toFixed(4)}
                      </li>
                      <li>
                        Stop :{" "}
                        {lastStep.stopLocation.name
                          ? lastStep.stopLocation.name
                          : lastStep.stopLocation.latitude.toFixed(4)}
                      </li>
                    </ul>
                  </Grid>
                </Grid>
              );
            })}
          </CardContent>
        ) : finished ? (
          <CardContent>No route found</CardContent>
        ) : null}
      </Card>
    );
  }
}

export default ResultBox;
