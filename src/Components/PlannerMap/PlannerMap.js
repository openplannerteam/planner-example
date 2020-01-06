import { Map, Marker, TileLayer } from "react-leaflet";
import React, { Component } from "react";

import { BasicTrainPlanner } from "plannerjs";
import { Box } from "@material-ui/core";
import MarkerPopup from "../MarkerPopup/MarkerPopup";
import QueryBox from "../QueryBox/QueryBox";
import styles from "./PlannerMap.module.css";

class PlannerMap extends Component {
  constructor(props) {
    super(props);

    this.state = { lat: 50.85045, lng: 4.34878, zoom: 9, markers: [], createdMarkers: []};
  }

  componentDidMount = () => {
    const planner = new BasicTrainPlanner();
    let markers = [];
    planner.getAllStops().then(stops => {
      markers = stops.filter(s=>s.avgStopTimes<100000);
      this.setState({ markers });
    });
  };

  onMapClick = (e) => {
    this.setState({
      createdMarkers: [...this.state.createdMarkers, {latitude: e.latlng.lat, longitude: e.latlng.lng}]
    })
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const { createdMarkers } = this.state;
    return (
      <Box boxShadow={2}>
        <QueryBox></QueryBox>
        <Map
          center={position}
          zoom={this.state.zoom}
          zoomControl={false}
          className={styles.map}
          onclick={this.onMapClick}
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {createdMarkers.map((m, index) => (
            <Marker key={index} position={[m.latitude, m.longitude]} draggable>
              <MarkerPopup></MarkerPopup>
            </Marker>
          ))}
        </Map>
      </Box>
    );
  }
}

export default PlannerMap;
