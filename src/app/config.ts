export interface UserParam {
  name: string;
  value: string;
}

export interface UserParams {
  userParams: UserParam[];
}

export const getUserParamValue = (name: string, params: UserParams) => {
  let value: string | undefined = undefined;
  const userParams = params.userParams;
  for (let i = 0; i < userParams.length; i++) {
    const userParam = userParams[i];

    if (userParam.name === name && userParam.value) {
      return userParam.value;
    }
  }

  return value;
};
