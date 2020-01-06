import {Button, Card, CardActions, CardContent, TextField, Typography} from "@material-ui/core";
import React, { Component } from "react";

import styles from "./QueryBox.module.css";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Card className={styles.topleft}>
        <CardContent>
          <TextField
            variant="outlined"
            label="Search start point"
            margin="dense"
          ></TextField>
          <Typography color="textSecondary" gutterBottom>
            Word of the Day
          </Typography>
          <Typography variant="h5" component="h2">
            test
          </Typography>
          <Typography color="textSecondary">adjective</Typography>
          <Typography variant="body2" component="p">
            well meaning and kindly.
            <br />
            {'"a benevolent smile"'}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Learn More</Button>
        </CardActions>
      </Card>
    );
  }
}

export default index;
