import { BasicTrainPlanner, Units } from "plannerjs";
import React, { Component } from "react";

import { Box } from "@material-ui/core";
import QueryBox from "../QueryBox/QueryBox";
import mapboxgl from "mapbox-gl";
import styles from "./PlannerMap.module.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic3VzaGlsZ2hhbWJpciIsImEiOiJjazUyZmNvcWExM2ZrM2VwN2I5amVkYnF5In0.76xcCe3feYPHsDo8eXAguw";

class PlannerMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lat: 50.85045,
      lng: 4.34878,
      zoom: 8,
      start: null,
      destination: null
    };
  }

  componentDidMount = () => {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });
    map.on("move", () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });
    map.on("click", e => {
      if (!this.state.start) {
        var startMarker = new mapboxgl.Marker()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setDraggable(true)
          .addTo(map);
        this.setState({ start: e.lngLat });
        startMarker.on("dragend", e => {
          this.setState({ start: e.target._lngLat }, () => {
            this.calculateRoute();
          });
        });
      } else if (!this.state.destination) {
        var destinationMarker = new mapboxgl.Marker()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setDraggable(true)
          .addTo(map);
        this.setState({ destination: e.lngLat }, () => {
          this.calculateRoute();
        });
        destinationMarker.on("dragend", e => {
          this.setState({ destination: e.target._lngLat }, () => {
            this.calculateRoute();
          });
        });
      }
    });
  };

  calculateRoute = () => {
    const { start, destination } = this.state;
    if (start && destination) {
      const planner = new BasicTrainPlanner();
      planner
        .query({
          from: { longitude: start.lng, latitude: start.lat },
          to: { longitude: destination.lng, latitude: destination.lat },
          minimumDepartureTime: new Date(),

          walkingSpeed: 3, // KmH
          minimumWalkingSpeed: 3, // KmH

          maximumWalkingDistance: 200, // meters

          minimumTransferDuration: Units.fromMinutes(1),
          maximumTransferDuration: Units.fromMinutes(30),

          maximumTravelDuration: Units.fromHours(1.5),

          maximumTransfers: 4
        })
        .take(3)
        .on("data", path => {
          console.log(path);
        })
        .on("end", () => {
          console.log("No more paths!");
        })
        .on("error", error => {
          console.error(error);
        });
    }
  };

  render() {
    return (
      <Box boxShadow={2}>
        <QueryBox></QueryBox>
        <div
          ref={el => (this.mapContainer = el)}
          className={styles.mapContainer}
        />
      </Box>
    );
  }
}

export default PlannerMap;
