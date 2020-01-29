import {
  EventBus,
  EventType,
  FlexibleProfileTransitPlanner,
  FlexibleRoadPlanner,
  FlexibleTransitPlanner,
  ReducedCarPlanner,
  TravelMode,
  TriangleTransitPlanner,
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
import connectionSources from "../../data/connectionSources";
import hull from "hull.js";
import stopSources from "../../data/stopSources";
import turfDistance from "@turf/distance";
import { point as turfPoint } from "@turf/helpers";

const planners = [
  {
    id: 1,
    name: "Flexible Profile Transit Planner",
    profile: TravelMode.Walking,
    class: FlexibleProfileTransitPlanner,
    description: FlexibleProfileTransitPlanner.description
  },
  {
    id: 2,
    name: "Flexible Road Planner",
    profile: "car",
    class: FlexibleRoadPlanner,
    description: FlexibleRoadPlanner.description
  },
  {
    id: 3,
    name: "Flexible Transit Planner",
    profile: TravelMode.Walking,
    class: FlexibleTransitPlanner,
    description: FlexibleTransitPlanner.description
  },
  {
    id: 4,
    name: "Reduced Car Planner",
    profile: "car",
    class: ReducedCarPlanner,
    description: ReducedCarPlanner.description
  },
  {
    id: 5,
    name: "Triangle Transit Planner",
    profile: TravelMode.Walking,
    class: TriangleTransitPlanner,
    description: TriangleTransitPlanner.description
  }
];

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1Ijoic3VzaGlsZ2hhbWJpciIsImEiOiJjazUyZmNvcWExM2ZrM2VwN2I5amVkYnF5In0.76xcCe3feYPHsDo8eXAguw"
});

class PlannerMap extends ReactQueryParams {
  defaultQueryParams = {
    planner: 3
  };
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
      planner: planners[0],
      selectedConnectionSources: [{ value: 0, label: connectionSources[0] }],
      newConnectionSourceId: connectionSources.length,
      selectedStopSources: [{ value: 0, label: stopSources[0] }],
      newStopSourceId: stopSources.length,
      pointReached: [],
      timeElapsed: 0,
      scannedDistance: 0
    };
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
      .on(EventType.ResourceFetch, resource => {
        const { url, duration } = resource;
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
      .on(EventType.ReachableID, locationId => {
        new this.state.planner.class()
          .resolveLocation(locationId)
          .then(location => {
            const { scannedDistance, start } = this.state;
            var from = turfPoint([start.lng, start.lat]);
            var to = turfPoint([location.longitude, location.latitude]);
            var distance = turfDistance(from, to);
            if (distance > scannedDistance) {
              this.setState({ scannedDistance: distance.toFixed(1) });
            }
            this.setState({
              pointReached: [...this.state.pointReached, location]
            });
          })
          .catch(error => {
            console.log(error);
          });
      });
  }

  componentDidMount = () => {
    let { start, destination, planner } = this.queryParams;
    if (!planner || isNaN(parseInt(planner))) {
      this.setQueryParams({ planner: 1 });
      planner = this.queryParams.planner;
    }
    this.setState(
      {
        start,
        destination,
        planner: planners.filter(p => p.id === parseInt(planner))[0]
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
  };

  startTimer = () => {
    this.timer = new Date();
  };

  stopTimer = () => {
    const millis = new Date() - this.timer;
    this.setState({ timeElapsed: millis });
  };

  addConnectionSourcesToPlanner = planner => {
    const { selectedConnectionSources } = this.state;
    selectedConnectionSources.forEach(s => {
      planner.addConnectionSource(s.label);
      console.log("added : ", s.label);
    });
  };

  addStopSourcesToPlanner = planner => {
    const { selectedStopSources } = this.state;
    selectedStopSources.forEach(s => {
      planner.addStopSource(s.label);
      console.log("added : ", s.label);
    });
  };

  calculateRoute = () => {
    const { start, destination, planner } = this.state;
    if (start && destination) {
      this.resetRoute();
      this.startTimer();
      this.setState({
        calculating: true
      });
      const plannerToUse = new planner.class();
      this.addConnectionSourcesToPlanner(plannerToUse);
      this.addStopSourcesToPlanner(plannerToUse);
      let blocked = false;
      plannerToUse
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
          const completePath = await plannerToUse.completePath(path);
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
          this.setState({ calculating: false }, () => {
            console.log(this.state);
          });
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

  changePlanner = plannerId => {
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
  };

  changeSelectedConnectionSources = newSources => {
    console.log(newSources);
    this.setState({ selectedConnectionSources: newSources });
  };

  addNewConnectionSource = source => {
    const { selectedConnectionSources, newConnectionSourceId } = this.state;
    this.setState({
      selectedConnectionSources: [
        ...selectedConnectionSources,
        { value: newConnectionSourceId, label: source },
      ],
      newConnectionSourceId: newConnectionSourceId+1
    });
  };

  changeSelectedStopSources = newSources => {
    this.setState({ selectedStopSources: newSources });
  };
  addNewStopSource = source => {
    const { selectedStopSources, newStopSourceId } = this.state;
    this.setState({
      selectedStopSources: [
        ...selectedStopSources,
        { value: newStopSourceId, label: source },
      ],
      newStopSourceId: newStopSourceId+1
    });
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
      planner,
      pointReached,
      timeElapsed,
      selectedConnectionSources,
      selectedStopSources,
      scannedDistance
    } = this.state;
    return (
      <Box boxShadow={2}>
        <ResultBox
          route={route}
          finished={finished}
          setFitBounds={this.setFitBounds}
          profile={planner.profile}
          timeElapsed={timeElapsed}
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
          response={route}
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
            routeCoords={routeCoords}
            profile={planner.profile}
          ></RouteLayer>
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
