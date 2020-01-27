import {
  Card,
  CardContent,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
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
    const { planners, selectedPlanner, changePlanner, disabled } = this.props;
    return (
      <Card className={styles.settingsBox}>
        <CardContent>
          <Typography variant="h6">Settings</Typography>
          <br></br>
          <FormGroup>
            <InputLabel>Planner :</InputLabel>
            <Select
              value={selectedPlanner.id}
              onChange={e => {
                changePlanner(e.target.value);
              }}
              fullWidth
              variant="outlined"
              margin="dense"
              disabled={disabled}
            >
              {planners.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormGroup>
        </CardContent>
      </Card>
    );
  }
}

export default SettingsBox;
