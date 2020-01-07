import { Card, CardContent, Typography } from "@material-ui/core";
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
          <Typography variant="h5">Settings</Typography>
        </CardContent>
      </Card>
    );
  }
}

export default index;
