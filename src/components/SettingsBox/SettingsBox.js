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
      stopSources,
      selectedStopSources,
      changeSelectedStopSources
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
              {selectedPlanner.description
                ? selectedPlanner.description
                : "No description available"}
            </Typography>
            <br />
            <InputLabel>Connection Sources :</InputLabel>
            <Select
              isDisabled={disabled}
              isMulti
              name="connection-sources"
              options={connectionSources}
              menuPortalTarget={document.querySelector("body")} //to make it on top
              onChange={changeSelectedConnectionSources}
              inputValue={this.state.connectionSourceInput}
              onInputChange={e => {
                this.setState({ connectionSourceInput: e });
              }}
              value={selectedConnectionSources}
              noOptionsMessage={() => {
                return (
                  <Typography variant="inherit">Add {this.state.connectionSourceInput}</Typography>
                );
              }}
            />
            <br/>
            <InputLabel>Stop Sources :</InputLabel>
            <Select
              isDisabled={disabled}
              isMulti
              name="stop-sources"
              options={stopSources}
              menuPortalTarget={document.querySelector("body")} //to make it on top
              onChange={changeSelectedStopSources}
              inputValue={this.state.stopSourceInput}
              onInputChange={e => {
                this.setState({ stopSourceInput: e });
              }}
              value={selectedStopSources}
              noOptionsMessage={() => {
                return (
                  <Typography variant="inherit">Add {this.state.stopSourceInput}</Typography>
                );
              }}
            />
          </FormGroup>
        </CardContent>
      </Card>
    );
  }
}

export default SettingsBox;
