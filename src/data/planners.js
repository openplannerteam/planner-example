import {
  FlexibleRoadPlanner,
  FlexibleTransitPlanner,
  TravelMode,
} from "plannerjs";

export default [
  {
    id: 1,
    name: "Flexible Road Planner",
    profile: TravelMode.Walking,
    class: FlexibleRoadPlanner,
    description: FlexibleRoadPlanner.description
  },
  {
    id: 2,
    name: "Flexible Transit Planner",
    profile: TravelMode.Walking,
    class: FlexibleTransitPlanner,
    description: FlexibleTransitPlanner.description
  }
];
