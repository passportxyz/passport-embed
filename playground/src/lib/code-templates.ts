import { PlaygroundConfig, defaultTheme } from "./default-config";

// Check if theme differs from default
function isCustomTheme(theme: PlaygroundConfig["theme"]): boolean {
  return JSON.stringify(theme) !== JSON.stringify(defaultTheme);
}

// Format theme object for code output
function formatThemeCode(theme: PlaygroundConfig["theme"], indent: number = 6): string {
  const spaces = " ".repeat(indent);
  const innerSpaces = " ".repeat(indent + 2);

  const parts: string[] = ["{"];

  if (theme.colors) {
    parts.push(`${innerSpaces}colors: {`);
    if (theme.colors.primary) parts.push(`${innerSpaces}  primary: "${theme.colors.primary}",`);
    if (theme.colors.secondary) parts.push(`${innerSpaces}  secondary: "${theme.colors.secondary}",`);
    if (theme.colors.background) parts.push(`${innerSpaces}  background: "${theme.colors.background}",`);
    if (theme.colors.success) parts.push(`${innerSpaces}  success: "${theme.colors.success}",`);
    if (theme.colors.failure) parts.push(`${innerSpaces}  failure: "${theme.colors.failure}",`);
    parts.push(`${innerSpaces}},`);
  }

  if (theme.radius) {
    parts.push(`${innerSpaces}radius: {`);
    if (theme.radius.widget) parts.push(`${innerSpaces}  widget: "${theme.radius.widget}",`);
    if (theme.radius.button) parts.push(`${innerSpaces}  button: "${theme.radius.button}",`);
    parts.push(`${innerSpaces}},`);
  }

  if (theme.font?.family) {
    parts.push(`${innerSpaces}font: {`);
    parts.push(`${innerSpaces}  family: {`);
    if (theme.font.family.body) parts.push(`${innerSpaces}    body: '${theme.font.family.body}',`);
    if (theme.font.family.heading) parts.push(`${innerSpaces}    heading: '${theme.font.family.heading}',`);
    parts.push(`${innerSpaces}  },`);
    parts.push(`${innerSpaces}},`);
  }

  parts.push(`${spaces}}`);

  return parts.join("\n");
}

// Generate React code
export function generateReactCode(config: PlaygroundConfig): string {
  const props: string[] = [];

  props.push(`      apiKey={process.env.REACT_APP_PASSPORT_API_KEY}`);
  props.push(`      scorerId={process.env.REACT_APP_PASSPORT_SCORER_ID}`);
  props.push(`      address={address}`);
  props.push(`      connectWalletCallback={handleConnect}`);
  props.push(`      generateSignatureCallback={handleSign}`);

  if (config.collapseMode !== "off") {
    props.push(`      collapseMode="${config.collapseMode}"`);
  }

  if (config.className) {
    props.push(`      className="${config.className}"`);
  }

  if (config.overrideEmbedServiceUrl) {
    props.push(`      overrideEmbedServiceUrl="${config.overrideEmbedServiceUrl}"`);
  }

  if (config.themePreset !== "dark" || isCustomTheme(config.theme)) {
    props.push(`      theme={${formatThemeCode(config.theme)}}`);
  }

  return `import { PassportScoreWidget } from '@human.tech/passport-embed';
import { useState } from 'react';

function MyComponent() {
  const [address, setAddress] = useState<string | undefined>();

  const handleConnect = async () => {
    // Connect to user's wallet and return the address
    // Example with wagmi: const { address } = await connect();
    const walletAddress = "0x..."; // Replace with actual wallet connection
    setAddress(walletAddress);
  };

  const handleSign = async (message: string) => {
    // Sign the message with the user's wallet
    // Example with wagmi: const signature = await signMessage({ message });
    const signature = "0x..."; // Replace with actual signature
    return signature;
  };

  return (
    <PassportScoreWidget
${props.join("\n")}
    />
  );
}

export default MyComponent;`;
}

// Generate Next.js code
export function generateNextJsCode(config: PlaygroundConfig): string {
  const props: string[] = [];

  props.push(`        apiKey={process.env.NEXT_PUBLIC_PASSPORT_API_KEY}`);
  props.push(`        scorerId={process.env.NEXT_PUBLIC_PASSPORT_SCORER_ID}`);
  props.push(`        address={address}`);
  props.push(`        connectWalletCallback={handleConnect}`);
  props.push(`        generateSignatureCallback={handleSign}`);

  if (config.collapseMode !== "off") {
    props.push(`        collapseMode="${config.collapseMode}"`);
  }

  if (config.className) {
    props.push(`        className="${config.className}"`);
  }

  if (config.overrideEmbedServiceUrl) {
    props.push(`        overrideEmbedServiceUrl="${config.overrideEmbedServiceUrl}"`);
  }

  if (config.themePreset !== "dark" || isCustomTheme(config.theme)) {
    props.push(`        theme={${formatThemeCode(config.theme, 8)}}`);
  }

  return `"use client";

import { PassportScoreWidget } from '@human.tech/passport-embed';
import { useState } from 'react';
import { useAccount, useConnect, useSignMessage } from 'wagmi';

export default function PassportWidget() {
  const { address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();

  const handleConnect = async () => {
    // Connect using the first available connector (e.g., MetaMask)
    const result = await connectAsync({ connector: connectors[0] });
    return result.accounts[0];
  };

  const handleSign = async (message: string) => {
    const signature = await signMessageAsync({ message });
    return signature;
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <PassportScoreWidget
${props.join("\n")}
      />
    </div>
  );
}`;
}

// Generate installation instructions
export function generateInstallCode(): string {
  return `# Using npm
npm install @human.tech/passport-embed

# Using yarn
yarn add @human.tech/passport-embed

# Using pnpm
pnpm add @human.tech/passport-embed`;
}

// Generate .env.example content
export function generateEnvCode(config: PlaygroundConfig): string {
  const lines = [
    "# Passport Embed Configuration",
    "# Get your API key and Scorer ID from https://passport.xyz",
    "",
    `NEXT_PUBLIC_PASSPORT_API_KEY=${config.apiKey || "your_api_key_here"}`,
    `NEXT_PUBLIC_PASSPORT_SCORER_ID=${config.scorerId || "your_scorer_id_here"}`,
  ];

  if (config.overrideEmbedServiceUrl) {
    lines.push("");
    lines.push("# Optional: Override the embed service URL (for testing)");
    lines.push(`NEXT_PUBLIC_PASSPORT_SERVICE_URL=${config.overrideEmbedServiceUrl}`);
  }

  return lines.join("\n");
}

// Generate theme import code
export function generateThemeImportCode(preset: PlaygroundConfig["themePreset"]): string {
  if (preset === "dark" || preset === "light") {
    const themeName = preset === "dark" ? "DarkTheme" : "LightTheme";
    return `import { PassportScoreWidget, ${themeName} } from '@human.tech/passport-embed';

// Use the preset theme
<PassportScoreWidget
  theme={${themeName}}
  // ... other props
/>`;
  }

  return "";
}
