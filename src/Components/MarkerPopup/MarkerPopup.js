import { Button, Grid, Typography } from "@material-ui/core";
import React, { Component } from "react";

import { Popup } from "react-leaflet";

class MarkerPopup extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Popup>
        <Grid container direction="row" spacing={1}>
          <Grid item xs>
            <Button fullWidth variant="outlined" size="small">
              <Typography variant="inherit">Origin</Typography>
            </Button>
          </Grid>
          <Grid item xs>
            <Button fullWidth variant="outlined" size="small">
              <Typography variant="inherit">Destination</Typography>
            </Button>
          </Grid>
        </Grid>
      </Popup>
    );
  }
}

export default MarkerPopup;
