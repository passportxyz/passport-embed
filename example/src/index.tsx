import { createRoot } from "react-dom/client";
import { PassportScoreWidget, usePassportScore } from "passport-widgets";

import "./index.css";

const apiKey = import.meta.env.VITE_API_KEY;
const scorerId = import.meta.env.VITE_SCORER_ID;

import "./index.css";

const App = () => {
  const address = "0x85fF01cfF157199527528788ec4eA6336615C989";
  const passportScore = usePassportScore({
    address,
    apiKey,
    scorerId,
    // overrideIamUrl: "http://localhost:80"
  });

  console.log("passportScore", passportScore);
  return (
    <div className="container">
      <h1>Passport Widgets Example</h1>
      <h3>Check your Passport score</h3>
      <PassportScoreWidget
        address="0x85fF01cfF157199527528788ec4eA6336615C989"
        apiKey={apiKey}
        scorerId={scorerId}
        // overrideIamUrl="http://localhost:80"
        /*
        theme={{
          colors: {
            primary: "255, 255, 0",
          },
        }}
        */
      />
      <div>
        <h1>This is an app element!</h1>
        <ul>
          <li>Passport Score: {passportScore.data?.score}</li>
          <li>Passport Threshold: {passportScore.data?.threshold}</li>
          <li>
            Is passing threshold:{" "}
            {passportScore.data?.passing_score ? "True" : "False"}
          </li>
          <li>
            What stamps?
            <pre>
              {JSON.stringify(passportScore.data?.stamps, undefined, 2)}
            </pre>
          </li>
        </ul>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
