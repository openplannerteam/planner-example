import {
  BasicTrainPlanner,
  EventBus,
  EventType,
  TransitCarPlanner,
  TravelMode,
  TriangleDemoPlanner,
  Units
} from "plannerjs";

import { Box } from "@material-ui/core";
import LogButton from "../LogButton/LogButton";
import LogModal from "../LogModal/LogModal";
import LogSummary from "../LogSummary/LogSummary";
import PointMarkerLayer from "../MapLayers/PointMarkerLayer";
import PointReacherLayer from "../MapLayers/PointReachedLayer";
import React from "react";
import ReactMapboxGl from "react-mapbox-gl";
import ReactQueryParams from "react-query-params";
import ResetButton from "../ResetButton/ResetButton";
import ResultBox from "../ResultBox/ResultBox";
import RouteLayer from "../MapLayers/RouteLayer";
import SettingsBox from "../SettingsBox/SettingsBox";
import StationMarkerLayer from "../MapLayers/StationMarkerLayer";
import hull from "hull.js";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1Ijoic3VzaGlsZ2hhbWJpciIsImEiOiJjazUyZmNvcWExM2ZrM2VwN2I5amVkYnF5In0.76xcCe3feYPHsDo8eXAguw"
});

class PlannerMap extends ReactQueryParams {
  constructor(props) {
    super(props);

    this.state = {
      center: [4.5118, 50.6282], //Belgium
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
      fitBounds: null,
      publicTransport: true,
      profile: "walking",
      triangleDemo: false,
      pointReached: [],
      timeElapsed: 0
    };
    this.trainPlanner = new BasicTrainPlanner();
    this.carPlanner = new TransitCarPlanner();
    this.triangleDemoPlanner = new TriangleDemoPlanner();
    this.timer = null;
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
      })
      .on(EventType.PointReached, async p => {
        try {
          const point = await p;
          this.setState({
            pointReached: [...this.state.pointReached, point]
          });
        } catch (error) {
          console.log(error);
        }
      });
  }

  componentDidMount = () => {
    const { start, destination } = this.queryParams;
    this.setState(
      {
        start,
        destination
      },
      () => {
        this.calculateRoute();
      }
    );
  };

  setFitBounds = fitBounds => {
    this.setState({
      fitBounds
    });
  };

  resetRoute = complete => {
    this.setState({
      finished: false,
      route: null,
      routeCoords: [],
      logs: [],
      query: null,
      scannedConnections: 0,
      routeStations: [],
      stationPopup: null,
      fitBounds: null,
      pointReached: []
    });
    if (complete) {
      this.setState({
        start: null,
        destination: null,
        center: [4.5118, 50.6282],
        zoom: [8]
      });
    }
  };

  startTimer = () => {
    this.timer = new Date();
  };

  stopTimer = () => {
    const millis = new Date() - this.timer;
    this.setState({ timeElapsed: millis });
  };

  calculateRoute = () => {
    const { start, destination, publicTransport, triangleDemo } = this.state;
    if (start && destination) {
      this.resetRoute();
      this.startTimer();
      this.setState({
        calculating: true
      });
      const planner = publicTransport
        ? triangleDemo
          ? this.triangleDemoPlanner
          : this.trainPlanner
        : this.carPlanner;
      let blocked = false;
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
        .on("data", async path => {
          console.log("this is a path");
          console.log(path);
          blocked = true;
          const completePath = await planner.completePath(path);
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
              travelMode: leg.travelMode
            });
          });
          const convexHull = hull(
            routeCoords.map(rc => rc.coords.map(c => c)).flat()
          );
          const longitudes = convexHull.map(c => c[0]);
          const latitudes = convexHull.map(c => c[1]);

          //[[westest, northest],[eastest, southest]]
          const zoomBoundaries = [
            [Math.min(...longitudes), Math.max(...latitudes)],
            [Math.max(...longitudes), Math.min(...latitudes)]
          ];
          this.setState({
            route: completePath,
            routeCoords,
            fitBounds: zoomBoundaries,
            routeStations
          });
          blocked = false;
          if (!this.state.calculating) {
            this.setState({ finished: true });
          }
        })
        .on("end", () => {
          console.log("No more paths!");
          this.setState({
            calculating: false,
            isLogModalOpen: false
          });
          if (!blocked) {
            this.setState({ finished: true });
          }
          this.stopTimer();
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
      this.setQueryParams({ start: coord });
      this.setState({ start: coord });
    } else if (!this.state.destination) {
      this.setQueryParams({ destination: coord });
      this.setState({ destination: coord }, () => {
        this.calculateRoute();
      });
    }
  };

  startDragEnd = e => {
    const newState = { start: e.lngLat };
    this.setQueryParams(newState);
    this.setState(newState, () => {
      this.calculateRoute();
    });
  };

  destinationDragEnd = e => {
    const newState = { destination: e.lngLat };
    this.setQueryParams(newState);
    this.setState(newState, () => {
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

  switchPublicTransport = () => {
    this.setState(
      {
        publicTransport: !this.state.publicTransport,
        profile: this.state.profile === "car" ? TravelMode.Walking : "car"
      },
      () => {
        this.resetRoute(false);
        this.calculateRoute();
      }
    );
  };

  switchTriangleDemo = () => {
    this.setState(
      {
        triangleDemo: !this.state.triangleDemo
      },
      () => {
        this.resetRoute(false);
        this.calculateRoute();
      }
    );
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
      fitBounds,
      publicTransport,
      profile,
      triangleDemo,
      pointReached,
      timeElapsed
    } = this.state;
    return (
      <Box boxShadow={2}>
        <ResultBox
          route={route}
          finished={finished}
          setFitBounds={this.setFitBounds}
          profile={profile}
          timeElapsed={timeElapsed}
        ></ResultBox>
        <LogButton
          openLogs={this.openLogModal}
          show={!isLogModalOpen && (calculating || finished)}
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
        <SettingsBox
          publicTransport={publicTransport}
          switchPublicTransport={this.switchPublicTransport}
          triangleDemo={triangleDemo}
          switchTriangleDemo={this.switchTriangleDemo}
          disabled={calculating}
        ></SettingsBox>
        <ResetButton show={finished} resetRoute={this.resetRoute}></ResetButton>
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
            padding: { top: 100, right: 150, bottom: 200, left: 470 }
          }}
        >
          <PointMarkerLayer
            startPoint={start}
            destinationPoint={destination}
            startDragEnd={this.startDragEnd}
            destinationDragEnd={this.destinationDragEnd}
            calculating={calculating}
          ></PointMarkerLayer>
          <RouteLayer routeCoords={routeCoords} profile={profile}></RouteLayer>
          <StationMarkerLayer
            routeStations={routeStations}
            showPopup={this.showPopup}
            hidePopup={this.hidePopup}
            stationPopup={stationPopup}
          ></StationMarkerLayer>
          <PointReacherLayer pointReached={pointReached}></PointReacherLayer>
        </Map>
      </Box>
    );
  }
}

export default PlannerMap;
