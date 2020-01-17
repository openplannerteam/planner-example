import { Feature, Layer } from "react-mapbox-gl";
import React, { Component } from "react";

class PointReacherLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { pointReached } = this.props;
    return (
      <React.Fragment>
        {pointReached && pointReached.length > 0 ? (
          <Layer
            type="circle"
            paint={{
              "circle-radius": 3,
              "circle-color": "#000000"
            }}
          >
            {pointReached
              .filter((p, index) => index % 10 === 0)
              .map((p, index) => (
                <Feature key={index} coordinates={[p.longitude, p.latitude]}></Feature>
              ))}
          </Layer>
        ) : null}
      </React.Fragment>
    );
  }
}

export default PointReacherLayer;
