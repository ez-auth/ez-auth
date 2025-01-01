export const toQueryParams = (params: { [key: string]: any }): string => {
  const elements = Object.keys(params);

  for (const element of elements) {
    if (params[element] === undefined) {
      delete params[element];
    }
  }

  return new URLSearchParams(params).toString();
};

export const generateNumericCode = (length: number): string =>
  Math.floor(
    10 ** (length - 1) + Math.random() * (10 ** length - 10 ** (length - 1) - 1),
  ).toString();
