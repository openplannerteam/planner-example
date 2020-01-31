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
import Worker from "../../workers/planner.worker";
import connectionSources from "../../data/connectionSources";
import hull from "hull.js";
import planners from "../../data/planners";
import stopSources from "../../data/stopSources";

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
      routes: [],
      selectedRouteIndex: 0,
      calculating: false,
      finished: false,
      isLogModalOpen: false,
      logs: [],
      query: null,
      scannedConnections: 0,
      routeStations: [],
      stationPopup: null,
      fitBounds: null,
      planner: planners[0],
      selectedConnectionSources: [{ value: 0, label: connectionSources[0] }],
      newConnectionSourceId: connectionSources.length,
      selectedStopSources: [{ value: 0, label: stopSources[0] }],
      newStopSourceId: stopSources.length,
      pointReached: [],
      timeElapsed: 0,
      scannedDistance: 0
    };

    this.setFitBounds = this.setFitBounds.bind(this);
    this.resetRoute = this.resetRoute.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.calculateRoute = this.calculateRoute.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.startDragEnd = this.startDragEnd.bind(this);
    this.destinationDragEnd = this.destinationDragEnd.bind(this);
    this.openLogModal = this.openLogModal.bind(this);
    this.closeLogModal = this.closeLogModal.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
    this.changePlanner = this.changePlanner.bind(this);
    this.changeSelectedConnectionSources = this.changeSelectedConnectionSources.bind(
      this
    );
    this.addNewConnectionSource = this.addNewConnectionSource.bind(this);
    this.changeSelectedStopSources = this.changeSelectedStopSources.bind(this);
    this.addNewStopSource = this.addNewStopSource.bind(this);
    this.changeSelectedRoute = this.changeSelectedRoute.bind(this);
    this.timer = null;
    this.worker = new Worker();
    this.worker.addEventListener("message", e => {
      const { type } = e.data;
      switch (type) {
        case "data":
          const { path, completePath } = e.data;
          console.log("this is a path");
          console.log(path);
          console.log(completePath);
          let routeCoords = [];
          let routeStations = [];
          completePath.legs.forEach(leg => {
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
            routes: [...this.state.routes, completePath],
            routeCoords: [...this.state.routeCoords, routeCoords],
            fitBounds: zoomBoundaries,
            routeStations: [...this.state.routeStations, routeStations]
          });
          break;
        case "end":
          console.log("No more paths!");
          this.setState({
            calculating: false,
            finished: true
          });
          this.stopTimer();
          break;
        case "error":
          const { error } = e.data;
          console.error(error);
          this.setState({ calculating: false });
          break;
        case "query":
          const { query } = e.data;
          console.log("Query", query);
          this.setState({ query });
          break;
        case "resourceFetch":
          const { resource } = e.data;
          const { url, duration } = resource;
          console.log(`[GET] ${url} (${duration}ms)`);
          let { logs, scannedConnections } = this.state;
          this.setState({
            logs: [...logs, { url, duration }],
            scannedConnections: scannedConnections + 1
          });
          break;
        case "pointReached":
          const { location, distance } = e.data;
          const { scannedDistance } = this.state;
          if (distance > scannedDistance) {
            this.setState({ scannedDistance: distance.toFixed(1) });
          }
          this.setState({
            pointReached: [...this.state.pointReached, location]
          });
          break;
        default:
          break;
      }
    });
  }

  componentDidMount() {
    let {
      start,
      destination,
      planner,
      connectionSources,
      stopSources
    } = this.queryParams;
    const { selectedConnectionSources, selectedStopSources } = this.state;
    let newConnectionSources = [];
    let newStopSources = [];
    if (!planner || isNaN(parseInt(planner))) {
      this.setQueryParams({ planner: 3 });
      planner = this.queryParams.planner;
    }
    if (connectionSources && connectionSources.length > 0) {
      newConnectionSources = connectionSources;
    } else {
      newConnectionSources = selectedConnectionSources;
    }
    if (stopSources && stopSources.length > 0) {
      newStopSources = stopSources;
    } else {
      newStopSources = selectedStopSources;
    }
    this.setState(
      {
        start,
        destination,
        planner: planners.filter(p => p.id === parseInt(planner))[0],
        selectedConnectionSources: newConnectionSources,
        selectedStopSources: newStopSources
      },
      () => {
        this.calculateRoute();
      }
    );
  }

  setFitBounds(fitBounds) {
    this.setState({
      fitBounds
    });
  }

  resetRoute(complete) {
    this.setState({
      finished: false,
      routes: [],
      routeCoords: [],
      selectedRouteIndex: 0,
      logs: [],
      query: null,
      scannedConnections: 0,
      routeStations: [],
      stationPopup: null,
      fitBounds: null,
      pointReached: [],
      scannedDistance: 0
    });
    if (complete) {
      this.setState({
        start: null,
        destination: null,
        center: [4.5118, 50.6282],
        zoom: [8]
      });
      this.setQueryParams({ start: undefined, destination: undefined });
    }
  }

  startTimer() {
    this.timer = new Date();
  }

  stopTimer() {
    const millis = new Date() - this.timer;
    this.setState({ timeElapsed: millis });
  }

  calculateRoute() {
    const {
      start,
      destination,
      planner,
      selectedConnectionSources,
      selectedStopSources
    } = this.state;
    if (start && destination) {
      this.resetRoute();
      this.startTimer();
      this.setState({
        calculating: true
      });
      this.worker.postMessage({
        start,
        destination,
        plannerId: planner.id,
        connectionSources: selectedConnectionSources.map(s => s.label),
        stopSources: selectedStopSources.map(s => s.label)
      });
    }
  }

  onMapClick(map, e) {
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
  }

  startDragEnd(e) {
    const newState = { start: e.lngLat };
    this.setQueryParams(newState);
    this.setState(newState, () => {
      this.calculateRoute();
    });
  }

  destinationDragEnd(e) {
    const newState = { destination: e.lngLat };
    this.setQueryParams(newState);
    this.setState(newState, () => {
      this.calculateRoute();
    });
  }

  openLogModal() {
    this.setState({ isLogModalOpen: true });
  }

  closeLogModal() {
    this.setState({ isLogModalOpen: false });
  }

  showPopup(station) {
    this.setState({ stationPopup: station });
  }

  hidePopup() {
    this.setState({ stationPopup: null });
  }

  changePlanner(plannerId) {
    this.setState(
      {
        planner: planners.filter(p => p.id === plannerId)[0]
      },
      () => {
        this.resetRoute(false);
        this.calculateRoute();
      }
    );
    this.setQueryParams({ planner: plannerId });
  }

  changeSelectedConnectionSources(newSources) {
    console.log(newSources);
    this.setState({ selectedConnectionSources: newSources });
    this.setQueryParams({ connectionSources: newSources });
  }

  addNewConnectionSource(source) {
    const { selectedConnectionSources, newConnectionSourceId } = this.state;
    const newSources = [
      ...selectedConnectionSources,
      { value: newConnectionSourceId, label: source }
    ];
    this.setState({
      selectedConnectionSources: newSources,
      newConnectionSourceId: newConnectionSourceId + 1
    });
    this.setQueryParams({ connectionSources: newSources });
  }

  changeSelectedStopSources(newSources) {
    this.setState({ selectedStopSources: newSources });
    this.setQueryParams({ stopSources: newSources });
  }
  addNewStopSource(source) {
    const { selectedStopSources, newStopSourceId } = this.state;
    const newSources = [
      ...selectedStopSources,
      { value: newStopSourceId, label: source }
    ];
    this.setState({
      selectedStopSources: newSources,
      newStopSourceId: newStopSourceId + 1
    });
    this.setQueryParams({ stopSources: newSources });
  }

  changeSelectedRoute(index){
    this.setState({
      selectedRouteIndex: index
    })
  }

  render() {
    const {
      center,
      zoom,
      start,
      destination,
      routeCoords,
      routes,
      calculating,
      finished,
      isLogModalOpen,
      logs,
      query,
      scannedConnections,
      routeStations,
      stationPopup,
      fitBounds,
      planner,
      pointReached,
      timeElapsed,
      selectedConnectionSources,
      selectedStopSources,
      scannedDistance,
      selectedRouteIndex
    } = this.state;
    return (
      <Box boxShadow={2}>
        <ResultBox
          routes={routes}
          finished={finished}
          setFitBounds={this.setFitBounds}
          profile={planner.profile}
          timeElapsed={timeElapsed}
          changeSelectedRoute={this.changeSelectedRoute}
        ></ResultBox>
        <LogButton
          openLogs={this.openLogModal}
          show={!isLogModalOpen && (calculating || finished)}
        ></LogButton>
        <LogSummary
          show={calculating || finished}
          scannedConnections={scannedConnections}
          scannedDistance={scannedDistance}
        ></LogSummary>
        <LogModal
          open={isLogModalOpen}
          onClose={this.closeLogModal}
          calculating={calculating}
          logs={logs}
          query={query}
        ></LogModal>
        <SettingsBox
          planners={planners}
          connectionSources={connectionSources}
          selectedConnectionSources={selectedConnectionSources}
          changeSelectedConnectionSources={this.changeSelectedConnectionSources}
          addNewConnectionSource={this.addNewConnectionSource}
          stopSources={stopSources}
          selectedStopSources={selectedStopSources}
          changeSelectedStopSources={this.changeSelectedStopSources}
          addNewStopSource={this.addNewStopSource}
          selectedPlanner={planner}
          changePlanner={this.changePlanner}
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
          <RouteLayer
            routeCoords={routeCoords[selectedRouteIndex]}
            profile={planner.profile}
          ></RouteLayer>
          <StationMarkerLayer
            routeStations={routeStations[selectedRouteIndex]}
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
