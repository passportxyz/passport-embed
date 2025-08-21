// Mock wallet provider for development/testing
export class MockWalletProvider {
  private connected = false;
  private accounts: string[] = [];
  
  constructor(private defaultAccount = '0x1234567890123456789012345678901234567890') {}

  async connect(): Promise<string[]> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
    this.accounts = [this.defaultAccount];
    return this.accounts;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.accounts = [];
  }

  async getAccounts(): Promise<string[]> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    return this.accounts;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    // Return a mock signature
    return `0xmock_signature_for_${message}`;
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