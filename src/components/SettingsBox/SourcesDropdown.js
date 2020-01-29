import { Button, InputLabel } from "@material-ui/core";
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
    const {
      disabled,
      sources,
      onChange,
      selected,
      title,
      addNewSource
    } = this.props;
    return (
      <div>
        <InputLabel>{title}</InputLabel>
        <Select
          isDisabled={disabled}
          isMulti
          name="connection-sources"
          options={sources.map((s, index) => {
            return { value: index, label: s };
          })}
          menuPortalTarget={document.querySelector("body")} //to make it on top
          onChange={onChange}
          inputValue={this.state.input}
          onInputChange={e => {
            this.setState({ input: e });
          }}
          value={selected}
          noOptionsMessage={() => {
            return (
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  addNewSource(this.state.input);
                  this.setState({ input: "" });
                }}
              >
                Add {this.state.input}
              </Button>
            );
          }}
        />
      </div>
    );
  }
}

export default SourcesDropdown;
