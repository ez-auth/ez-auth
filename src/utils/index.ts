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

export const generateRandomString = (length: number): string => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateRandomBase32String = (length: number): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // Base32 characters
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    result += alphabet[randomIndex];
  }

  return result;
};
