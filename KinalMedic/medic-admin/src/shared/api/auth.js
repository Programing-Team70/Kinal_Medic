import { axiosAuth, axiosAdmin } from './api';

export const login = async (data) => {
  return await axiosAuth.post('/login', data);
};

export const getAllUsers = async () => {
  const { data } = await axiosAdmin.get('/all'); 
  return { users: data };
};

export const register = async (data) => {
  return await axiosAdmin.post('/register', data);
};
