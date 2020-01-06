import { Button, Grid, Typography } from "@material-ui/core";
import React, { Component } from "react";

import { Popup } from "react-leaflet";

class MarkerPopup extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {stop} = this.props;
    return (
      <Popup>
        <Grid container direction="row" spacing={1}>
          {stop?<Typography variant="h6">{stop.name}</Typography>:null}
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
