import {
  FlexibleProfileTransitPlanner,
  FlexibleRoadPlanner,
  FlexibleTransitPlanner,
  ReducedCarPlanner,
  TravelMode,
  TriangleTransitPlanner
} from "plannerjs";

export default [
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
