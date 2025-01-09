import { createRoot } from "react-dom/client";
import { PassportScoreWidget, usePassportScore } from "passport-widgets";
import { setConfig } from "passport-widgets/config";

import "./index.css";

const API_KEY = import.meta.env.VITE_API_KEY;
const SCORER_ID = import.meta.env.VITE_SCORER_ID;

setConfig({
  apiKey: API_KEY,
  scorerId: SCORER_ID,
  // overrideIamUrl: "http://localhost:80",
  overrideIamUrl: "https://embed.review.passport.xyz"
});

import "./index.css";

const App = () => {
  const address = "0x85fF01cfF157199527528788ec4eA6336615C989";
  const passportScore = usePassportScore({ enabled: true, address });
  console.log("passportScore", passportScore);
  return (
    <div className="container">
      <h1>Passport Widgets Example</h1>
      <h3>Check your Passport score</h3>
      <PassportScoreWidget
<<<<<<< HEAD
        apiKey="0x123"
        address="0x96DB2c6D93A8a12089f7a6EdA5464e967308AdEd"
        scorerId="5"
        overrideIamUrl="http://localhost:8888/api/v0.0.0"
=======
        address="0x85fF01cfF157199527528788ec4eA6336615C989"
        enabled={true}
>>>>>>> 2964-demo-widget
        /*
        theme={{
          colors: {
            primary: "255, 255, 0",
          },
        }}
        */
      />
<<<<<<< HEAD
=======
      <div>
        <h1>This is an app element!</h1>
        <ul>
          <li>Passport Score: {passportScore.data?.score}</li>
          <li>Passport Threshold: {passportScore.data?.threshold}</li>
          <li>Is passing threshold: {passportScore.data?.passing_score?"True":"False"}</li>
          <li>
            What stamps?
            <pre>
              {JSON.stringify(passportScore.data?.stamps, undefined, 2)}
            </pre>
          </li>
        </ul>
      </div>
>>>>>>> 2964-demo-widget
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
