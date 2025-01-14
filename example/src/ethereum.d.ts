interface Window {
  ethereum?: {
    request(args: { method: "eth_requestAccounts" }): Promise<string[]>;
  };
}
