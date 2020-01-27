import { Feature, Layer, Popup } from "react-mapbox-gl";
import React, { Component } from "react";

class StationMarkerLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { routeStations, showPopup, hidePopup, stationPopup } = this.props;
    const stationsMarkers =
      routeStations && routeStations.length > 0
        ? routeStations.map((s, index) => {
            return (
              <Feature
                onMouseEnter={() => {
                  showPopup(s);
                }}
                onMouseLeave={hidePopup}
                key={index}
                coordinates={s.coords}
              ></Feature>
            );
          })
        : null;
    return (
      <React.Fragment>
        {routeStations && routeStations.length > 0 ? (
          <React.Fragment>
            <Layer type="symbol" layout={{ "icon-image": "rail-15" }}>
              {stationsMarkers}
            </Layer>
            {stationPopup ? (
              <Popup coordinates={stationPopup.coords}>
                <h4>{stationPopup.name}</h4>
              </Popup>
            ) : null}
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }
}

export default StationMarkerLayer;
