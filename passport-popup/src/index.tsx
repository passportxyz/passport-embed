import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

// This will be read form env variables and configured with the embed verify functionality
// const VERIFICATION_URL = "http://localhost:8003/api/v0.0.0/verify";
const VERIFICATION_URL = "iam.staging.passport.xyz/api/v0.0.0/verify";

function App() {
  // Get query parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const address = urlParams.get("address");
  const signature = urlParams.get("signature");
  const challenge = urlParams.get("challenge");

  const hasRun = useRef(false);

  if (address && signature && challenge) {
    // store in local storage
    // when the OAuth flow is complete, the code will be present but the address, signature and challenge will be null
    // so we only store them in the localStorage if they are not null.
    localStorage.setItem("address", address);
    localStorage.setItem("signature", signature);
    localStorage.setItem("challenge", challenge);
  }

  useEffect(() => {
    if (hasRun.current) return; // Prevent multiple runs

    const handleOAuthFlow = async () => {
      const verifyEndpoint = VERIFICATION_URL;

      // Check if the required values are missing
      const isBadRequest =
        (!code || !state) && (!address || !signature || !challenge);

      if (isBadRequest) {
        return (
          <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
            <h1>Bad Request</h1>
            <p>Missing required parameters for OAuth verification.</p>
          </div>
        );
      }

      if (!code) {
        // if there is no code present we are in the first step of the OAuth flow
        console.log("No authorization code found. Redirecting to LinkedIn...");
        const state = generateRandomState();
        const linkedinAuthUrl = getOAuthUrl(state);
        window.location.href = await linkedinAuthUrl;
      } else {
        // the code is preset, make the verify call to chaim the stamp
        console.log("Authorization code found:", code);
        // get address , challenge and signature from local storage
        const _address = localStorage.getItem("address");
        const _signature = localStorage.getItem("signature");
        const _challenge = localStorage.getItem("challenge");

        try {
          const payload = {
            type: "Linkedin",
            types: ["Linkedin"],
            version: "0.0.0",
            address: address || "unknown",
            proofs: {
              code,
              sessionKey: state || "default_state",
            },
            signatureType: "EIP712",
            signature: _address || null,
            challenge: _challenge,
            signedChallenge: _signature,
          };

          // Make the verify call
          const response = await fetchVerifiableCredential(
            verifyEndpoint,
            payload
          );

          console.log("Verification response:", response);

          if (window.opener) {
            window.opener.postMessage(
              { type: "oauth_success", data: "" },
              window.location.origin
            );
          }
          window.close(); // Close the pop-up after sending the message
        } catch (error) {
          console.error("Error during verification:", error);
          if (window.opener) {
            window.opener.postMessage(
              { type: "oauth_error", error: error.message },
              window.location.origin
            );
          }
        }
      }
    };

    handleOAuthFlow();
  }, []);

  const generateRandomState = (): string => {
    return Math.random().toString(36).substring(2);
  };

  // this will be taken dynamically from the platform Provider.
  // the provider name will be received as a query parameter

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
    verifyEndpoint: string,
    payload: {
      type: string;
      types: string[];
      version: string;
      address: string;
      proofs: { code: string; sessionKey: string };
      signatureType: string;
      signature?: string | null;
    }
  ): Promise<any> => {
    // try {
    const response = await fetch(verifyEndpoint, {
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
    <>
      <div style={{ textAlign: "center", padding: "20px", color: "green" }}>
        <h1>LinkedIn OAuth Pop-Up</h1>
        <p>Redirecting to LinkedIn...</p>
      </div>
    </>
    // <div style={{ textAlign: "center", padding: "20px" }}>
    //   <h1>LinkedIn OAuth Pop-Up</h1>
    //   <p>Click the button below to authenticate with LinkedIn.</p>
    //   <button onClick={handleLogin}>Login with LinkedIn</button>
    // </div>
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
