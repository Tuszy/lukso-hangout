// Styling
import "./App.css";
import { useState } from "react";
import { StartScreen } from "./ui/StartScreen";
import { GameScreen } from "./ui/GameScreen";

function App() {
  const [joined, setJoined] = useState<boolean>(false);

  return !joined ? (
    <StartScreen onJoin={() => setJoined(true)} />
  ) : (
    <GameScreen />
  );
}

export default App;
