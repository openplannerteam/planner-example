import {
  Card,
  CardContent,
  FormGroup,
  InputLabel,
  Select as MaterialSelect,
  MenuItem,
  Typography
} from "@material-ui/core";
import React, { Component } from "react";

import Select from "react-select";
import styles from "./SettingsBox.module.css";

class SettingsBox extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      planners,
      selectedPlanner,
      changePlanner,
      disabled,
      connectionSources,
      stopSources
    } = this.props;
    return (
      <Card className={styles.settingsBox}>
        <CardContent>
          <Typography variant="h6">Settings</Typography>
          <br />
          <FormGroup>
            <InputLabel>Planner :</InputLabel>
            <MaterialSelect
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
            </MaterialSelect>
            <Typography variant="caption">
              {selectedPlanner.description ? selectedPlanner.description : "No description available"}
            </Typography>
            <br />
            <InputLabel>Connection Sources :</InputLabel>
            <div className={styles.selects}>
              <Select
                isMulti
                name="colors"
                options={connectionSources.map(s => {
                  return { value: s, label: s };
                })}
                menuPortalTarget={document.querySelector('body')}
                onChange={(e)=>{console.log(e)}}
                value={[]}
              />
            </div>
          </FormGroup>
        </CardContent>
      </Card>
    );
  }
}

export default SettingsBox;
