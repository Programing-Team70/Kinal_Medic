import { axiosAuth, axiosAdmin } from './api';

export const login = async (data) => {
  return await axiosAuth.post('/login', data);
};

export const getAllUsers = async () => {
  const { data } = await axiosAdmin.get('/all'); 
  return { users: data };
};

export const register = async (data) => {
  return await axiosAuth.post('/register', data);
};

export const createUser = async (data) => {
  return await axiosAdmin.post('/create', data);
};

export const getStudentByCarnet = async (carnet) => {
  const { data } = await axiosAdmin.get(`/carnet/${encodeURIComponent(carnet)}`);
  return data;
};

export const getMyProfile = async () => {
  const { data } = await axiosAuth.get('/me');
  return data;
};

export const getMedics = async () => {
  const { data } = await axiosAuth.get('/medics');
  return Array.isArray(data) ? data : [];
};

export const updateUser = async (id, data) => {
  return await axiosAdmin.put(`/update/${id}`, data);
};

export const deleteUser = async (id) => {
  return await axiosAdmin.delete(`/delete/${id}`);
};
