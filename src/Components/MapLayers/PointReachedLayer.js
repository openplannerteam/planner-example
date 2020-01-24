import React, { Component } from "react";

import { GeoJSONLayer } from "react-mapbox-gl";
import hull from "hull.js";

class PointReacherLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { pointReached } = this.props;
    const polygonPoints = hull(
      pointReached.map(p => [p.longitude, p.latitude]),
      20
    );
    return (
      <React.Fragment>
        {pointReached && pointReached.length > 0 ? (
          <React.Fragment>
            <GeoJSONLayer
              data={{
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [polygonPoints]
                }
              }}
              fillPaint={{
                "fill-color": "#ff0000",
                "fill-opacity": 0.3
              }}
            ></GeoJSONLayer>
          </React.Fragment>
        ) : //
        null}
      </React.Fragment>
    );
  }
}

export default PointReacherLayer;
