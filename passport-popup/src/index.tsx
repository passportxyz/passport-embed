import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

function App() {
  useEffect(() => {
    const handleOAuthFlow = async () => {
      const iamUrl = "http://localhost:8003/api/v0.0.0/verify";

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (!code) {
        console.log("No authorization code found. Redirecting to LinkedIn...");
        const state = generateRandomState();
        const linkedinAuthUrl = getOAuthUrl(state);
        window.location.href = await linkedinAuthUrl;
      } else {
        console.log("Authorization code found:", code);

        try {
          const payload = {
            type: "platform_id",
            types: ["Linkedin"],
            version: "0.0.0",
            address: "0xxxxxxxxxxx",
            proofs: {
              code,
              sessionKey: state || "default_state",
            },
            signatureType: "IAM_SIGNATURE_TYPE",
          };

          const response = await fetchVerifiableCredential(iamUrl, payload);
          console.log("Verification response:", response);
        } catch (error) {
          console.error("Error during verification:", error);
        }
      }
    };

    handleOAuthFlow();
  }, []);

  const generateRandomState = (): string => {
    return Math.random().toString(36).substring(2);
  };

  const getOAuthUrl = async (state: string): Promise<string> => {
    const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.REACT_APP_LINKEDIN_CLIENT_ID!,
      redirect_uri: process.env.REACT_APP_LINKEDIN_REDIRECT_URI!,
      scope: "profile email openid",
      state: state,
    });

    const linkedinUrl = `${AUTH_URL}?${params.toString()}`;
    return await Promise.resolve(linkedinUrl);
  };

  const handleLogin = async () => {
    const state = "random_state_value";
    const linkedinUrl = await getOAuthUrl(state);
    window.location.href = linkedinUrl;
  };

  const fetchVerifiableCredential = async (
    iamUrl: string,
    payload: {
      type: string;
      types: string[];
      version: string;
      address: string;
      proofs: { code: string; sessionKey: string };
      signatureType: string;
    }
  ): Promise<any> => {
    // try {
    const response = await fetch(iamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Verification failed with status ${response.status}`);
    }

    return await response.json();
    // } catch (error) {
    //   console.error("Error verifying credentials:", error);
    //   throw error;
    // }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>LinkedIn OAuth Pop-Up</h1>
      <p>Click the button below to authenticate with LinkedIn.</p>
      <button onClick={handleLogin}>Login with LinkedIn</button>
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
