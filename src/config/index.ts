export type PassportEmbedConfig = {
  apiKey: string;
  scorerId: string;
  overrideIamUrl: string;
};

export const config: PassportEmbedConfig = {
  apiKey: "",
  scorerId: "",
  overrideIamUrl: "",
};

export const setConfig = (newConfig: PassportEmbedConfig) => {
  Object.assign(config, newConfig);
};
