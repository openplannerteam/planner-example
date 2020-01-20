import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography
} from "@material-ui/core";
import React, { Component } from "react";

import styles from "./SettingsBox.module.css";

class SettingsBox extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      publicTransport,
      switchPublicTransport,
      triangleDemo,
      switchTriangleDemo
    } = this.props;
    return (
      <Card className={styles.topleft}>
        <CardContent>
          <Typography variant="h6">Settings</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={publicTransport}
                  value="publicTransport"
                  onChange={switchPublicTransport}
                  color="primary"
                />
              }
              label="Use Public Transport"
            />
            {publicTransport ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={triangleDemo}
                    onChange={switchTriangleDemo}
                    value="gilad"
                    color="primary"
                  />
                }
                label="Triangle demo planner"
              />
            ) : null}
          </FormGroup>
        </CardContent>
      </Card>
    );
  }
}

export default SettingsBox;
