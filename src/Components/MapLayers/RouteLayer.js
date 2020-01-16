import { Feature, Layer } from "react-mapbox-gl";
import React, { Component } from "react";

import { TravelMode } from "plannerjs";

class RouteLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { routeCoords, profile } = this.props;
    return (
      <React.Fragment>
        {routeCoords && routeCoords.length > 0
          ? routeCoords
              .filter(
                c => c.travelMode === TravelMode.Train
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
              .filter(c => c.travelMode === TravelMode.Walking || (c.travelMode === TravelMode.Profile && profile === "walking"))
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
          {routeCoords && routeCoords.length > 0
          ? routeCoords
              .filter(c => c.travelMode === TravelMode.Profile && profile === "car")
              .map((c, index) => (
                <Layer
                  key={index}
                  type="line"
                  layout={{
                    "line-cap": "round",
                    "line-join": "round"
                  }}
                  paint={{
                    "line-color": "#6b03fc", //purple
                    "line-width": 4
                  }}
                >
                  <Feature coordinates={c.coords} />
                </Layer>
              ))
          : null}
          {routeCoords && routeCoords.length > 0
          ? routeCoords
              .filter(c => c.travelMode === TravelMode.Bus)
              .map((c, index) => (
                <Layer
                  key={index}
                  type="line"
                  layout={{
                    "line-cap": "round",
                    "line-join": "round"
                  }}
                  paint={{
                    "line-color": "#048f04", //green
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
