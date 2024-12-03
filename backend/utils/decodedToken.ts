import jwt from 'jsonwebtoken';

const decodedToken = (token: any) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export default decodedToken;
