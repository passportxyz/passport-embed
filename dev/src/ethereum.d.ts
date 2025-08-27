interface Window {
  ethereum?: {
    request(args: { method: "eth_requestAccounts" }): Promise<string[]>;
    request(args: { method: "personal_sign"; params: string[] }): Promise<string>;
  };
}
