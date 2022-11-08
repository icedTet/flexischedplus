export const verifyToken = (token: string) => {
  return token && token.length === 128;
};
