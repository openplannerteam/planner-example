import { Card, CardContent, CircularProgress, Grid } from "@material-ui/core";
import React, { Component } from "react";

import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
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
            {route.legs.map(leg=>{
              return leg.steps.map((s, index)=>{
                return (
                  <Grid container key={index}>
                    <Grid item xs={1}>
                      <p>
                        {leg.travelMode === "walking" ? (
                          <DirectionsWalkIcon />
                        ) : leg.travelMode === "train" ? (
                          <TrainIcon />
                        ) : null}
                      </p>
                    </Grid>
                    <Grid item xs={11}>
                      <ul style={{ listStyleType: "none" }}>
                        <li>
                          Duration : {(s.duration.average / 60000).toFixed(1)}{" "}
                          minutes
                        </li>
                        <li>
                          Start :{" "}
                          {s.startLocation.name
                            ? s.startLocation.name
                            : s.startLocation.latitude.toFixed(4)}
                        </li>
                        <li>
                          Stop :{" "}
                          {s.stopLocation.name
                            ? s.stopLocation.name
                            : s.stopLocation.latitude.toFixed(4)}
                        </li>
                      </ul>
                    </Grid>
                  </Grid>
                );
              })
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
