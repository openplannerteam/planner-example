import { Box, Container, Typography } from "@material-ui/core";
import React, { Component } from "react";

class Information extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Container>
        <Box p={3}>
          <Typography variant="h4">Information</Typography>
          <Typography variant="inherit">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Typography>
        </Box>
      </Container>
    );
  }
}

export default Information;
