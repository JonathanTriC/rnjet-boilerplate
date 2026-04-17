import { AxiosRequestConfig, AxiosResponse } from 'axios';

export type ApiProps = {
  url: string;
  statusCode?: number;
  body?: any;
  fullResponse?: boolean;
  tags?: string;
  headers?: any;
  retry?: number;
  config?: AxiosRequestConfig;
  resHeaders?: boolean;
};

export type ApiLog = {
  nameFunction: string;
  body?: any;
  tags?: string;
  res?: AxiosResponse<any, any> | any;
  e?: any;
  isDownload?: boolean;
};

export interface GenerateCurlProps {
  res: AxiosResponse<any, any> | any;
  url: string;
  nameFunction: string;
  tags: string;
  isError?: string;
}

export type ApiError<T = unknown> = {
  success: boolean;
  message: string;
  errors?: T;
};
