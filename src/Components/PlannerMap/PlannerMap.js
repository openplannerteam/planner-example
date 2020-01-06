import { Map, Marker, TileLayer } from "react-leaflet";
import React, { Component } from "react";

import { Box } from "@material-ui/core";
import MarkerPopup from "../MarkerPopup/MarkerPopup";
import QueryBox from "../QueryBox/QueryBox";
import styles from "./PlannerMap.module.css";

class PlannerMap extends Component {
  constructor(props) {
    super(props);

    this.state = { lat: 50.85045, lng: 4.34878, zoom: 9 };
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <Box boxShadow={2}>
        <QueryBox></QueryBox>
        <Map
          center={position}
          zoom={this.state.zoom}
          zoomControl={false}
          className={styles.map}
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} draggable>
            <MarkerPopup></MarkerPopup>
          </Marker>
        </Map>
      </Box>
    );
  }
}

export default PlannerMap;
