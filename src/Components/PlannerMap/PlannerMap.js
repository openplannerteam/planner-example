import {
  BasicTrainPlanner,
  EventBus,
  EventType,
  TransitCarPlanner,
  TravelMode,
  TriangleDemoPlanner,
  Units
} from "plannerjs";
import React, { Component } from "react";

import { Box } from "@material-ui/core";
import LogButton from "../LogButton/LogButton";
import LogModal from "../LogModal/LogModal";
import LogSummary from "../LogSummary/LogSummary";
import PointMarkerLayer from "../MapLayers/PointMarkerLayer";
import PointReacherLayer from "../MapLayers/PointReachedLayer";
import ReactMapboxGl from "react-mapbox-gl";
import ResetButton from "../ResetButton/ResetButton";
import ResultBox from "../ResultBox/ResultBox";
import RouteLayer from "../MapLayers/RouteLayer";
import SettingsBox from "../SettingsBox/SettingsBox";
import StationMarkerLayer from "../MapLayers/StationMarkerLayer";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1Ijoic3VzaGlsZ2hhbWJpciIsImEiOiJjazUyZmNvcWExM2ZrM2VwN2I5amVkYnF5In0.76xcCe3feYPHsDo8eXAguw"
});

class PlannerMap extends Component {
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
    if (!this.timer) {
      this.timer = setInterval(this.updateTime, 1000);
    }
  };

  stopTimer = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
  };

  resetTimer = () => {
    if (this.timer) {
      this.setState({
        timeElapsed: 0
      });
      this.timer = null;
    }
  };

  updateTime = () => {
    this.setState({
      timeElapsed: this.state.timeElapsed + 1
    });
  };

  calculateRoute = () => {
    const { start, destination, publicTransport, triangleDemo } = this.state;
    if (start && destination) {
      this.resetRoute();
      this.resetTimer();
      this.startTimer();
      this.setState({
        calculating: true
      });
      this.setFitBounds([
        [start.lng, start.lat],
        [destination.lng, destination.lat]
      ]);
      const planner = publicTransport
        ? triangleDemo
          ? this.triangleDemoPlanner
          : this.trainPlanner
        : this.carPlanner;
      let waiting = false;
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
          waiting = true;
          const completePath = await planner.completePath(path);
          console.log(completePath);
          let routeCoords = [];
          let routeStations = [];
          let westest =
            start.lng < destination.lng ? start.lng : destination.lng;
          let eastest =
            start.lng > destination.lng ? start.lng : destination.lng;
          let northest =
            start.lat > destination.lat ? start.lat : destination.lat;
          let southest =
            start.lat < destination.lat ? start.lat : destination.lat;
          completePath.legs.forEach((leg, index) => {
            let coords = [];
            const lngMin = Math.min(
              ...leg.steps.map(s => s.startLocation.longitude),
              ...leg.steps.map(s => s.stopLocation.longitude)
            );
            const lngMax = Math.max(
              ...leg.steps.map(s => s.startLocation.longitude),
              ...leg.steps.map(s => s.stopLocation.longitude)
            );
            const latMin = Math.min(
              ...leg.steps.map(s => s.startLocation.latitude),
              ...leg.steps.map(s => s.stopLocation.latitude)
            );
            const latMax = Math.max(
              ...leg.steps.map(s => s.startLocation.latitude),
              ...leg.steps.map(s => s.stopLocation.latitude)
            );
            if (lngMin < westest) {
              westest = lngMin;
            }
            if (lngMax > eastest) {
              eastest = lngMax;
            }
            if (latMin < southest) {
              southest = latMin;
            }
            if (latMax > northest) {
              northest = latMax;
            }
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
          this.setState({
            route: completePath,
            routeCoords,
            fitBounds: [
              [westest, northest],
              [eastest, southest]
            ],
            routeStations
          });
          waiting = false;
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
          if (!waiting) {
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
