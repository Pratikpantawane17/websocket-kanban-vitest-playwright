import React from "react";
import KanbanBoard from "./components/KanbanBoard";

function App() {
  return (
    <div className="App">
     <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-6"> Real-time Kanban Board </h1>
      <KanbanBoard />
    </div>
  );
}

export default App;
