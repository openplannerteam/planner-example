import "./App.css";

import Information from "./Components/Information/Information";
import PlannerMap from "./Components/PlannerMap/PlannerMap";
import React from "react";

function App() {
  return (
    <div className="App">
      <PlannerMap></PlannerMap>
      <Information></Information>
    </div>
  );
}

export default App;
