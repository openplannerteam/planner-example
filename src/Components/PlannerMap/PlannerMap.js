import { BasicTrainPlanner, EventBus, EventType, Units } from "plannerjs";
import React, { Component } from "react";

import { Box } from "@material-ui/core";
import LogButton from "../LogButton/LogButton";
import LogModal from "../LogModal/LogModal";
import LogSummary from "../LogSummary/LogSummary";
import PointMarkerLayer from "../MapLayers/PointMarkerLayer";
import ReactMapboxGl from "react-mapbox-gl";
import ResultBox from "../ResultBox/ResultBox";
import RouteLayer from "../MapLayers/RouteLayer";
import StationMarkerLayer from "../MapLayers/StationMarkerLayer";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1Ijoic3VzaGlsZ2hhbWJpciIsImEiOiJjazUyZmNvcWExM2ZrM2VwN2I5amVkYnF5In0.76xcCe3feYPHsDo8eXAguw"
});

class PlannerMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      center: [4.5118, 50.6282],
      zoom: [8],
      start: null,
      destination: null,
      routeCoords: [],
      route: null,
      calculating: false,
      finished: false,
      isLogModalOpen: false,
      logs: [],
      query: null,
      scannedConnections: 0,
      routeStations: [],
      stationPopup: null,
      fitBounds: null
    };
    this.planner = new BasicTrainPlanner();
    EventBus.on(EventType.InvalidQuery, error => {
      console.log("InvalidQuery", error);
    })
      .on(EventType.AbortQuery, reason => {
        console.log("AbortQuery", reason);
      })
      .on(EventType.Query, query => {
        console.log("Query", query);
        this.setState({ query });
      })
      .on(EventType.LDFetchGet, (url, duration) => {
        console.log(`[GET] ${url} (${duration}ms)`);
        let { logs, scannedConnections } = this.state;
        this.setState({
          logs: [...logs, { url, duration }],
          scannedConnections: scannedConnections + 1
        });
      })
      .on(EventType.Warning, e => {
        console.warn(e);
      });
  }

  calculateRoute = () => {
    const { start, destination } = this.state;
    if (start && destination) {
      this.setState({
        calculating: true,
        finished: false,
        route: null,
        routeCoords: [],
        logs: [],
        query: null,
        scannedConnections: 0,
        routeStations: [],
        stationPopup: null,
        fitBounds: null
      });
      this.planner
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
        .on("data", async path => {
          console.log("this is a path");
          console.log(path);
          const completePath = await this.planner.completePath(path);
          console.log(completePath);
          let routeCoords = [];
          let routeStations = [];
          completePath.legs.forEach((leg, index) => {
            let coords = [];
            leg.steps.forEach(step => {
              const startCoords = [
                step.startLocation.longitude,
                step.startLocation.latitude
              ];
              const stopCoords = [
                step.stopLocation.longitude,
                step.stopLocation.latitude
              ];
              coords.push(startCoords);
              coords.push(stopCoords);
              if (step.startLocation.name) {
                routeStations.push({
                  coords: startCoords,
                  name: step.startLocation.name
                });
              }
              if (step.stopLocation.name) {
                routeStations.push({
                  coords: stopCoords,
                  name: step.stopLocation.name
                });
              }
            });
            routeCoords.push({
              coords: [...coords],
              travelMode: path.legs[index].travelMode
            });
          });
          if (path.legs[0].steps.length > 0) {
            const startLocation = path.legs[0].steps[0].startLocation;
            const legsCount = path.legs.length - 1;
            const lastLegStepsCount = path.legs[legsCount].steps.length - 1;
            const endLocation =
              path.legs[legsCount].steps[lastLegStepsCount].stopLocation;
            this.setState({
              route: path,
              routeCoords,
              fitBounds: [
                [startLocation.longitude, startLocation.latitude],
                [endLocation.longitude, endLocation.latitude]
              ],
              routeStations
            });
          }
        })
        .on("end", () => {
          console.log("No more paths!");
          this.setState({
            calculating: false,
            finished: true,
            isLogModalOpen: false
          });
        })
        .on("error", error => {
          console.error(error);
          this.setState({ calculating: false });
        });
    }
  };

  onMapClick = (map, e) => {
    const coord = e.lngLat;
    if (!this.state.start) {
      this.setState({ start: coord });
    } else if (!this.state.destination) {
      this.setState({ destination: coord }, () => {
        this.calculateRoute();
      });
    }
  };

  startDragEnd = e => {
    const newCoord = e.lngLat;
    this.setState({ start: newCoord }, () => {
      this.calculateRoute();
    });
  };

  destinationDragEnd = e => {
    const newCoord = e.lngLat;
    this.setState({ destination: newCoord }, () => {
      this.calculateRoute();
    });
  };

  openLogModal = () => {
    this.setState({ isLogModalOpen: true });
  };

  closeLogModal = () => {
    this.setState({ isLogModalOpen: false });
  };

  showPopup = station => {
    this.setState({ stationPopup: station });
  };

  hidePopup = () => {
    this.setState({ stationPopup: null });
  };

  render() {
    const {
      center,
      zoom,
      start,
      destination,
      routeCoords,
      route,
      calculating,
      finished,
      isLogModalOpen,
      logs,
      query,
      scannedConnections,
      routeStations,
      stationPopup,
      fitBounds
    } = this.state;
    return (
      <Box boxShadow={2}>
        <ResultBox
          calculating={calculating}
          route={route}
          finished={finished}
        ></ResultBox>
        <LogButton
          openLogs={this.openLogModal}
          show={!isLogModalOpen}
        ></LogButton>
        <LogSummary
          show={calculating || finished}
          scannedConnections={scannedConnections}
        ></LogSummary>
        <LogModal
          open={isLogModalOpen}
          onClose={this.closeLogModal}
          calculating={calculating}
          logs={logs}
          query={query}
          response={route}
        ></LogModal>
        <Map
          // eslint-disable-next-line
          style="mapbox://styles/mapbox/streets-v9"
          containerStyle={{
            height: "100vh",
            width: "100vw"
          }}
          center={center}
          zoom={zoom}
          onClick={this.onMapClick}
          fitBounds={fitBounds}
          fitBoundsOptions={{
            padding: { top: 100, right: 100, bottom: 200, left: 500 }
          }}
        >
          <PointMarkerLayer
            startPoint={start}
            destinationPoint={destination}
            startDragEnd={this.startDragEnd}
            destinationDragEnd={this.destinationDragEnd}
            calculating={calculating}
          ></PointMarkerLayer>
          <RouteLayer routeCoords={routeCoords}></RouteLayer>
          <StationMarkerLayer
            routeStations={routeStations}
            showPopup={this.showPopup}
            hidePopup={this.hidePopup}
            stationPopup={stationPopup}
          ></StationMarkerLayer>
        </Map>
      </Box>
    );
  }
}

export default PlannerMap;
