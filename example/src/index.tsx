import { createRoot } from "react-dom/client";
import { PassportScoreWidget } from "passport-widgets";

const App = () => {
  return (
    <div>
      <h1>Passport Widgets Example</h1>
      <PassportScoreWidget />
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
