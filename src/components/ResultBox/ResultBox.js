import { Card, CardContent, Grid, Typography } from "@material-ui/core";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import TrainIcon from "@material-ui/icons/Train";
import { TravelMode } from "plannerjs";
import hull from "hull.js";
import styles from "./ResultBox.module.css";

class ResultBox extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.changeTab = this.changeTab.bind(this);
  }
  msToTime(duration) {
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
  }

  changeTab(index){
    this.props.changeSelectedRoute(index);
  }

  render() {
    const { routes, finished, setFitBounds, profile, timeElapsed } = this.props;
    return (
      <Card className={styles.resultBox}>
        {routes && routes.length > 0 ? (
          <CardContent className={styles.resultContent}>
            <Tabs onSelect={this.changeTab}>
              <TabList>
                {routes.map((r, index) => {
                  return <Tab key={index}>Route {index+1}</Tab>;
                })}
              </TabList>

              {routes.map((r, index) => {
                return (
                  <TabPanel key={index}>
                    <Typography variant="h6">
                      Total duration :{" "}
                      {this.msToTime(
                        r.legs.reduce(
                          (a, b) =>
                            a +
                            b.steps.reduce(
                              (c, d) =>
                                c + d.duration.average || d.duration.minimum,
                              0
                            ),
                          0
                        )
                      )}
                    </Typography>
                    <Typography variant="caption">
                      Route calculated in {timeElapsed / 1000}s
                    </Typography>
                    {r.legs.map((leg, index) => {
                      const firstStep = leg.steps[0];
                      const lastStep = leg.steps[leg.steps.length - 1];
                      const duration = leg.steps.reduce(
                        (c, d) => c + d.duration.average || d.duration.minimum,
                        0
                      );
                      let zoomBoundaries = [
                        [
                          firstStep.startLocation.longitude,
                          firstStep.startLocation.latitude
                        ],
                        [
                          lastStep.stopLocation.longitude,
                          lastStep.stopLocation.latitude
                        ]
                      ];
                      if (leg.steps.length > 1) {
                        const convexHull = hull(
                          leg.steps
                            .map(s => [
                              [
                                s.startLocation.longitude,
                                s.startLocation.latitude
                              ],
                              [
                                s.stopLocation.longitude,
                                s.stopLocation.latitude
                              ]
                            ])
                            .flat()
                        );
                        const longitudes = convexHull.map(c => c[0]);
                        const latitudes = convexHull.map(c => c[1]);
                        //[[westest, northest],[eastest, southest]]
                        zoomBoundaries = [
                          [Math.min(...longitudes), Math.max(...latitudes)],
                          [Math.max(...longitudes), Math.min(...latitudes)]
                        ];
                      }
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
                            setFitBounds(zoomBoundaries);
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
                                  : firstStep.startLocation.latitude.toFixed(
                                      4
                                    ) +
                                    ", " +
                                    firstStep.startLocation.longitude.toFixed(
                                      4
                                    )}
                              </li>
                              <li>
                                Stop :{" "}
                                {lastStep.stopLocation.name
                                  ? lastStep.stopLocation.name
                                  : lastStep.stopLocation.latitude.toFixed(4) +
                                    ", " +
                                    lastStep.stopLocation.longitude.toFixed(4)}
                              </li>
                            </ul>
                          </Grid>
                        </Grid>
                      );
                    })}
                  </TabPanel>
                );
              })}
            </Tabs>
          </CardContent>
        ) : finished ? (
          <CardContent>No route found</CardContent>
        ) : null}
      </Card>
    );
  }
}

export default ResultBox;
