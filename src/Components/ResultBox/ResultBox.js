import { Card, CardContent, Grid } from "@material-ui/core";
import React, { Component } from "react";

import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import TrainIcon from "@material-ui/icons/Train";
import { TravelMode } from "plannerjs";
import styles from "./ResultBox.module.css";

class ResultBox extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  msToTime = duration => {
    let minutes = parseInt((duration / (1000 * 60)) % 60);
    let hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    return hours !== 0
      ? hours +
          " Hour" +
          (hours > 1 ? "s " : "") +
          " and " +
          minutes +
          " minute" +
          (minutes > 1 ? "s" : "")
      : minutes + " minute" + (minutes > 1 ? "s" : "");
  };

  render() {
    const { route, finished, setFitBounds, profile } = this.props;
    return (
      <Card className={styles.bottomleft}>
        {route ? (
          <CardContent>
            <h5>
              Total duration :{" "}
              {this.msToTime(
                route.legs.reduce(
                  (a, b) =>
                    a + b.steps.reduce((c, d) => c + d.duration.average, 0),
                  0
                )
              )}
            </h5>
            {route.legs.map((leg, index) => {
              const firstStep = leg.steps[0];
              const lastStep = leg.steps[leg.steps.length - 1];
              const duration = leg.steps.reduce(
                (c, d) => c + d.duration.average,
                0
              );
              return (
                <Grid
                  container
                  key={index}
                  className={`${styles.legBox} ${
                    leg.travelMode === TravelMode.Walking ||
                    (leg.travelMode === TravelMode.Profile &&
                      profile === TravelMode.Walking)
                      ? styles.borderWalking
                      : leg.travelMode === TravelMode.Train
                      ? styles.borderTrain
                      : leg.travelMode === TravelMode.Profile &&
                        profile === "car"
                      ? styles.borderCar
                      : leg.travelMode === TravelMode.Bus
                      ? styles.borderBus
                      : ""
                  }`}
                  onClick={() => {
                    setFitBounds([
                      [
                        firstStep.startLocation.longitude,
                        firstStep.startLocation.latitude
                      ],
                      [
                        lastStep.stopLocation.longitude,
                        lastStep.stopLocation.latitude
                      ]
                    ]);
                  }}
                >
                  <Grid item xs={1}>
                    <p>
                      {leg.travelMode === TravelMode.Walking ||
                      (leg.travelMode === TravelMode.Profile &&
                        profile === TravelMode.Walking) ? (
                        <DirectionsWalkIcon />
                      ) : leg.travelMode === TravelMode.Train ? (
                        <TrainIcon />
                      ) : leg.travelMode === TravelMode.Profile &&
                        profile === "car" ? (
                        <DriveEtaIcon />
                      ) : leg.travelMode === TravelMode.Bus ? (
                        <DirectionsBusIcon />
                      ) : null}
                    </p>
                  </Grid>
                  <Grid item xs={11}>
                    <ul style={{ listStyleType: "none" }}>
                      <li>Duration : {this.msToTime(duration)}</li>
                      <li>
                        Start :{" "}
                        {firstStep.startLocation.name
                          ? firstStep.startLocation.name
                          : firstStep.startLocation.latitude.toFixed(4) +
                            ", " +
                            firstStep.startLocation.longitude.toFixed(4)}
                      </li>
                      <li>
                        Stop :{" "}
                        {lastStep.stopLocation.name
                          ? lastStep.stopLocation.name
                          : lastStep.stopLocation.latitude.toFixed(4) +
                            ", " +
                            firstStep.stopLocation.longitude.toFixed(4)}
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
