import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

const VERIFICATION_URL = "http://localhost:8003/api/v0.0.0/verify";
function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const address = urlParams.get("address");
  const signature = urlParams.get("signature");

  const redirectUri = new URL(process.env.REACT_APP_LINKEDIN_REDIRECT_URI!);
  redirectUri.searchParams.set("address", address as string);
  redirectUri.searchParams.set("signature", signature as string);
  console.log("DEBUG Redirect URI:", redirectUri.toString());
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return; // Prevent multiple runs

    const handleOAuthFlow = async () => {
      const iamUrl = VERIFICATION_URL;

      if (!code) {
        console.log("No authorization code found. Redirecting to LinkedIn...");
        const state = generateRandomState();
        const linkedinAuthUrl = getOAuthUrl(
          state,
          address as string,
          signature as string
        );
        window.location.href = await linkedinAuthUrl;
      } else {
        console.log("Authorization code found:", code);

        console.log("Start waiting...");
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        await wait(15000);
        console.log("Done waiting...");
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
            signature: address || null,
            // challenge: { ... },
            // signedChallenge: { ...},
          };

          console.log("HELLO REQUEST", payload);
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

  // this will be taken dynamically from the platform Provider.
  // the provider name will be received as a query parameter

  const getOAuthUrl = async (
    state: string,
    address: string,
    signature: string
  ): Promise<string> => {
    const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.REACT_APP_LINKEDIN_CLIENT_ID!,
      redirect_uri: `${process.env
        .REACT_APP_LINKEDIN_REDIRECT_URI!}?address=${address}&signature=${signature}`,
      scope: "profile email openid",
      state: state,
    });

    const linkedinUrl = `${AUTH_URL}?${params.toString()}`;
    return await Promise.resolve(linkedinUrl);
  };

  const handleLogin = async () => {
    const state = "random_state_value";
    const linkedinUrl = await getOAuthUrl(
      state,
      address as string,
      signature as string
    );
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
      signature?: string | null;
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
