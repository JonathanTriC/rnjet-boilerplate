import { BASE_URL } from '@constants/url';
import axios, { CreateAxiosDefaults } from 'axios';

const baseConfig: CreateAxiosDefaults<any> = {
  baseURL: BASE_URL,
  headers: {
    accept: 'application/json',
  },
  /* other custom settings */
  timeout: 10000,
};

const clientWithoutToken = axios.create(baseConfig);
clientWithoutToken.interceptors.response.use(
  async function (response) {
    // dismissLoading();
    return Promise.resolve(response);
  },
  async function (error) {
    return Promise.reject(error);
  },
);

export { clientWithoutToken };
