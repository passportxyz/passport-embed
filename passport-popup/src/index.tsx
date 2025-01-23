import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";

// This will be read form env variables and configured with the embed verify functionality
const VERIFICATION_URL = "http://localhost:8003/api/v0.0.0/verify";
// const VERIFICATION_URL = "https://iam.staging.passport.xyz/api/v0.0.0/verify";

function App() {
  // Get query parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const address = urlParams.get("address");
  const signature = urlParams.get("signature");
  const challenge = urlParams.get("challenge");
  // const originUrl = urlParams.get("originUrl");
  const hasRun = useRef(false);
  const [step, setStep] = useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [verificationResponse, setVerificationResponse] = useState<any | null>(
    undefined
  );
  if (address && signature && challenge) {
    // && originUrl
    // store in local storage
    // when the OAuth flow is complete, the code will be present but the address, signature and challenge will be null
    // so we only store them in the localStorage if they are not null.
    localStorage.setItem("address", address);
    localStorage.setItem("signature", signature);
    localStorage.setItem("challenge", challenge);
    // localStorage.setItem("originUrl", originUrl);
  }

  useEffect(() => {
    if (hasRun.current) return; // Prevent multiple runs

    const handleOAuthFlow = async () => {
      const verifyEndpoint = VERIFICATION_URL;

      // Check if the required values are missing
      const isBadRequest =
        (!code || !state) && (!address || !signature || !challenge);

      if (isBadRequest) {
        setStep("Bad Request: Missing required parameters.");
        return (
          <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
            <h1>Bad Request</h1>
            <p>Missing required parameters for OAuth verification.</p>
          </div>
        );
      }

      if (!code) {
        setStep("Making the OAuth call...");
        // if there is no code present we are in the first step of the OAuth flow
        console.log("No authorization code found. Redirecting to LinkedIn...");
        const state = generateRandomState();
        const linkedinAuthUrl = getOAuthUrl(state);
        window.location.href = await linkedinAuthUrl;
      } else {
        setStep("Making the verify call...");
        // the code is preset, make the verify call to chaim the stamp
        console.log("Authorization code found:", code);
        // get address , challenge and signature from local storage
        const _address = localStorage.getItem("address");
        const _signature = localStorage.getItem("signature");
        const _challenge = localStorage.getItem("challenge");
        // const _originUrl = localStorage.getItem("originUrl");
        try {
          const payload = {
            payload: {
              type: "Linkedin",
              types: ["Linkedin"],
              version: "0.0.0",
              address: _address || "unknown",
              proofs: {
                code,
                sessionKey: state || "default_state",
                signature: _signature,
              },
              signatureType: "EIP712",
            },
            challenge: _challenge,
          };

          // Make the verify call
          const response = await fetchVerifiableCredential(
            verifyEndpoint,
            payload
          );
          // Wait for 1 minute before proceeding
          // console.log("Origin URL:", _originUrl);
          // console.log("Waiting for 1 minute before proceeding...");
          // await new Promise((resolve) => setTimeout(resolve, 60000));
          // console.log("1 minute has passed. Proceeding ...");

          console.log("Verification response:", response);
          setStep("Verification successful!");
          setVerificationResponse(response);

          // if (window.opener) {
          //   console.log("window.opener ", window.opener);
          //   window.opener.postMessage(
          //     { step: "popup_closed", type: "oauth_success", data: "" },
          //     _originUrl
          //     // window.location.origin // This is not working
          //   );
          // }
          // window.close(); // Close the pop-up after sending the message
        } catch (error) {
          console.error("Error during verification:", error);
          setStep(`Verification failed to ${verifyEndpoint}`);
          setError(error.message);

          // if (window.opener) {
          //   window.opener.postMessage(
          //     {
          //       step: "popup_closed",
          //       type: "oauth_error",
          //       error: error.message,
          //     },  //     _originUrl
          //     window.location.origin
          //   );
          // }

          // window.close(); // Close the pop-up after sending the message
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

  const fetchVerifiableCredential = async (
    verifyEndpoint: string,
    data: {
      payload: {
        type: string;
        types: string[];
        version: string;
        address: string;
        proofs: { code: string; sessionKey: string };
      };
      challenge: string | null;
    }
  ): Promise<any> => {
    // try {

    let parsedChallenge;
    try {
      parsedChallenge = data.challenge ? JSON.parse(data.challenge) : null;
    } catch (error) {
      setStep("Error parsing local storage values.");
      setError("Invalid JSON format in local storage.");
      return;
    }

    const response = await fetch(verifyEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: { ...data.payload },
        challenge: parsedChallenge,
      }),
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
        <p>step: {step}</p>
        <p>verification response: {verificationResponse}</p>
        <p>error: {error}</p>
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
