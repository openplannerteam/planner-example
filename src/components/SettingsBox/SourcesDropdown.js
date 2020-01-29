import { InputLabel, Typography } from "@material-ui/core";
import React, { Component } from "react";

import Select from "react-select";

class SourcesDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: ""
    };
  }

  render() {
    const { disabled, sources, onChange, selected, title } = this.props;
    return (
      <div>
        <InputLabel>{title}</InputLabel>
        <Select
          isDisabled={disabled}
          isMulti
          name="connection-sources"
          options={sources}
          menuPortalTarget={document.querySelector("body")} //to make it on top
          onChange={onChange}
          inputValue={this.state.input}
          onInputChange={e => {
            this.setState({ input: e });
          }}
          value={selected}
          noOptionsMessage={() => {
            return (
              <Typography variant="inherit">Add {this.state.input}</Typography>
            );
          }}
        />
      </div>
    );
  }
}

export default SourcesDropdown;
