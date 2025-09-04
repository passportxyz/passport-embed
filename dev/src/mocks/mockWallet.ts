// Mock wallet provider for development/testing
export class MockWalletProvider {
  private connected = false;
  private accounts: string[] = [];

  constructor(private defaultAccount = "0x1234567890123456789012345678901234567890") {}

  async connect(): Promise<string[]> {
    console.log("%c🔐 [Mock Wallet] Simulating wallet connection...", "color: #4CAF50; font-weight: bold");
    console.log(`%c   → User would normally see MetaMask popup here`, "color: #888");

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.connected = true;
    this.accounts = [this.defaultAccount];

    console.log(`%c✅ [Mock Wallet] Connected with address: ${this.defaultAccount}`, "color: #4CAF50");
    console.log(`%c   → Simulated user clicking "Connect" in wallet popup`, "color: #888");

    return this.accounts;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.accounts = [];
  }

  async getAccounts(): Promise<string[]> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }
    return this.accounts;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    console.log("%c🖊️ [Mock Wallet] Signature request received", "color: #FF9800; font-weight: bold");
    console.log(
      `%c   → Message to sign: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
      "color: #888"
    );
    console.log(`%c   → User would see MetaMask signature popup here`, "color: #888");

    // Simulate signature delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const signature = `0xmock_signature_for_${message}`;
    console.log(`%c✅ [Mock Wallet] Signature generated`, "color: #4CAF50");
    console.log(`%c   → Simulated user clicking "Sign" in wallet popup`, "color: #888");
    console.log(`%c   → Mock signature: ${signature.substring(0, 30)}...`, "color: #888");

    // Return a mock signature
    return signature;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Switch account for testing different scenarios
  switchAccount(address: string): void {
    if (this.connected) {
      this.accounts = [address];
    }
  }
}

// Factory function to create mock wallet callbacks
export function createMockWalletCallbacks(mockWallet = new MockWalletProvider()) {
  return {
    connectWalletCallback: async () => {
      const accounts = await mockWallet.connect();
      // In a real app, you'd update your state management here
      return accounts[0];
    },

    generateSignatureCallback: async (message: string) => {
      return mockWallet.signMessage(message);
    },

    // Helper for testing
    mockWallet,
  };
}
