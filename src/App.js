import React from "react";
import Sidebar from "./SidebarComponents/Sidebar";
import AddTask from "./AddTaskComponents/AddTask"
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="app-main">
        {/* <h1>TaskFlow</h1> */}
        {/* Main content area */}
        {/* <p>
          This is where your tasks and details will appear. Resize the window to see the responsive behavior.
        </p> */}
        <AddTask categories={[]} onAddTask={() => {}} />
      </main>
    </div>
  );
}

export default App;
