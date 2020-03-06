import { EventBus, EventType, Units } from "plannerjs";

import planners from "../data/planners";
import turfDistance from "@turf/distance";
import { point as turfPoint } from "@turf/helpers";

let planner = null;
let startPoint = null;
function addConnectionSourcesToPlanner(planner, sources) {
  sources.forEach(s => {
    planner.addConnectionSource(s);
    console.log("added : ", s);
  });
}

function addStopSourcesToPlanner(planner, sources) {
  sources.forEach(s => {
    planner.addStopSource(s);
    console.log("added : ", s);
  });
}
EventBus.on(EventType.InvalidQuery, error => {
  console.log("InvalidQuery", error);
})
  .on(EventType.AbortQuery, reason => {
    console.log("AbortQuery", reason);
  })
  .on(EventType.Query, query => {
    self.postMessage({ type: "query", query });
  })
  .on(EventType.ResourceFetch, resource => {
    const { url, duration } = resource;
    self.postMessage({ type: "resourceFetch", resource: { url, duration } });
  })
  .on(EventType.Warning, e => {
    console.warn(e);
  })
  .on(EventType.ReachableID, locationId => {
    planner
      .resolveLocation(locationId)
      .then(location => {
        var from = turfPoint([startPoint.lng, startPoint.lat]);
        var to = turfPoint([location.longitude, location.latitude]);
        var distance = turfDistance(from, to);
        self.postMessage({ type: "pointReached", location, distance });
      })
      .catch(error => {
        console.log(error);
      });
  });

self.addEventListener("message", e => {
  console.log("Init web worker for Planner.js :)");
  const {
    start,
    destination,
    plannerId,
    stopSources,
    connectionSources
  } = e.data;
  const plannerToUse = planners.filter(p => p.id === plannerId)[0].class;
  planner = new plannerToUse();
  startPoint = start;
  addConnectionSourcesToPlanner(planner, connectionSources);
  addStopSourcesToPlanner(planner, stopSources);
  // configureEventBus(planner, start);
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

      maximumTravelDuration: Units.fromHours(3),

      maximumTransfers: 4
    })
    .take(4)
    .on("data", async path => {
      const completePath = await planner.completePath(path);
      self.postMessage({ type: "data", path, completePath });
    })
    .on("end", () => {
      self.postMessage({ type: "end" });
    })
    .on("error", error => {
      self.postMessage({ type: "error", error });
    });
});
