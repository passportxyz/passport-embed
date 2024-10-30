import { createRoot } from "react-dom/client";
import { PassportScoreWidget } from "passport-widgets";

const App = () => {
  return (
    <div
      style={{
        backgroundColor: "#000000",
        color: "#ffffff",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>Passport Widgets Example</h1>
        <div style={{ marginTop: "20px", marginBottom: "12px" }}>
          Check your Passport score
        </div>
        <PassportScoreWidget
          apiKey="TODO"
          address="0x96DB2c6D93A8a12089f7a6EdA5464e967308AdEd"
          scorerId="5"
        />
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
