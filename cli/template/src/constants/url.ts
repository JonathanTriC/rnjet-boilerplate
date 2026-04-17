import Config from 'react-native-config';

export const BASE_URL = Config.API_URL;
export const API_PREFIX = 'api';
export const AUTH_PREFIX = 'auth';

export const URL_PATH = {
  // MARK: AUTH
  auth: {
    register: `${API_PREFIX}/${AUTH_PREFIX}/register`,
  },
};
