export type PassportEmbedConfig = {
  apiKey: string;
  scorerId: string;
  overrideIamUrl: string;
  overrideEmbedPopUpUrl: string;
};

export const config: PassportEmbedConfig = {
  apiKey: "",
  scorerId: "",
  overrideIamUrl: "",
  overrideEmbedPopUpUrl: "",
};

export const setConfig = (newConfig: PassportEmbedConfig) => {
  Object.assign(config, newConfig);
};
