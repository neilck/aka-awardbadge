export interface ConfigParam {
  name: string;
  value: string;
}

export interface ConfigParams {
  configParams: ConfigParam[];
}

export const getConfigParamValue = (name: string, params: ConfigParams) => {
  let value: string | undefined = undefined;
  const configParams = params.configParams;
  for (let i = 0; i < configParams.length; i++) {
    const configParam = configParams[i];

    if (configParam.name === name && configParam.value) {
      return configParam.value;
    }
  }

  return value;
};
