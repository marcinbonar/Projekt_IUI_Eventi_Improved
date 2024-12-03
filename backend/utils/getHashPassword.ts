import bcrypt from 'bcrypt';

export const getHashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};
