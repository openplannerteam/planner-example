import { Feature, Layer } from "react-mapbox-gl";
import React, { Component } from "react";

class RouteLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { routeCoords } = this.props;
    return (
      <React.Fragment>
        {routeCoords && routeCoords.length > 0
          ? routeCoords
              .filter(
                c => c.travelMode === "train" || c.travelMode === "profile"
              )
              .map((c, index) => (
                <Layer
                  key={index}
                  type="line"
                  layout={{
                    "line-cap": "round",
                    "line-join": "round"
                  }}
                  paint={{
                    "line-color": "#005eab", //blue
                    "line-width": 4
                  }}
                >
                  <Feature coordinates={c.coords} />
                </Layer>
              ))
          : null}
        {routeCoords && routeCoords.length > 0
          ? routeCoords
              .filter(c => c.travelMode === "walking")
              .map((c, index) => (
                <Layer
                  key={index}
                  type="line"
                  layout={{
                    "line-cap": "round",
                    "line-join": "round"
                  }}
                  paint={{
                    "line-color": "#f7ff00", //yellow
                    "line-width": 4
                  }}
                >
                  <Feature coordinates={c.coords} />
                </Layer>
              ))
          : null}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
