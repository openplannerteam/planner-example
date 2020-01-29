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

import SourcesDropdown from "./SourcesDropdown";
import styles from "./SettingsBox.module.css";

class SettingsBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      connectionSourceInput: "",
      stopSourceInput: ""
    };
  }
  addConnectionSource = () => {
    this.props.addNewConnectionSource(this.state.connectionSourceInput);
    this.setState({ connectionSourceInput: "" });
  };

  render() {
    const {
      planners,
      selectedPlanner,
      changePlanner,
      disabled,
      connectionSources,
      selectedConnectionSources,
      changeSelectedConnectionSources,
      addNewConnectionSource,
      stopSources,
      selectedStopSources,
      changeSelectedStopSources,
      addNewStopSource
    } = this.props;
    return (
      <Card className={styles.settingsBox}>
        <CardContent>
          <Typography variant="h6">Settings</Typography>
          <br />
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
            <Typography variant="caption">
              {selectedPlanner.description
                ? selectedPlanner.description
                : "No description available"}
            </Typography>
            <br />
            <SourcesDropdown
              title="Connection Sources :"
              disabled={disabled}
              sources={connectionSources}
              onChange={changeSelectedConnectionSources}
              selected={selectedConnectionSources}
              addNewSource={addNewConnectionSource}
            ></SourcesDropdown>
            <br />
            <SourcesDropdown
              title="Stop Sources :"
              disabled={disabled}
              sources={stopSources}
              onChange={changeSelectedStopSources}
              selected={selectedStopSources}
              addNewSource={addNewStopSource}
            ></SourcesDropdown>
          </FormGroup>
        </CardContent>
      </Card>
    );
  }
}

export default SettingsBox;
