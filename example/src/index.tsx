import { createRoot } from "react-dom/client";
import { PassportScoreWidget } from "passport-widgets";

import "./index.css";

const App = () => {
  return (
    <div className="container">
      <h1>Passport Widgets Example</h1>
      <h3>Check your Passport score</h3>
      <PassportScoreWidget
        apiKey="TODO"
        address="0x96DB2c6D93A8a12089f7a6EdA5464e967308AdEd"
        scorerId="5"
        /*
        theme={{
          colors: {
            primary: "255, 255, 0",
          },
        }}
        */
      />
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
