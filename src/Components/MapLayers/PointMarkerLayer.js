import { Feature, Layer } from "react-mapbox-gl";
import React, { Component } from "react";

class PointMarkerLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      startPoint,
      destinationPoint,
      startDragEnd,
      destinationDragEnd,
      calculating
    } = this.props;
    return (
      <React.Fragment>
        {startPoint ? (
          <Layer
            type="circle"
            paint={{
              "circle-radius": 7,
              "circle-color": "#3887be"
            }}
          >
            <Feature
              coordinates={[startPoint.lng, startPoint.lat]}
              draggable={!calculating}
              onDragEnd={startDragEnd}
            ></Feature>
          </Layer>
        ) : null}
        {destinationPoint ? (
          <Layer
            type="circle"
            paint={{
              "circle-radius": 7,
              "circle-color": "#6b7cff"
            }}
          >
            <Feature
              coordinates={[destinationPoint.lng, destinationPoint.lat]}
              draggable={!calculating}
              onDragEnd={destinationDragEnd}
            ></Feature>
          </Layer>
        ) : null}
      </React.Fragment>
    );
  }
}

export default PointMarkerLayer;
