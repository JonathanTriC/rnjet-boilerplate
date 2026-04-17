import { ApiLog, GenerateCurlProps } from './apiType';

const logApi = (props: ApiLog) => {
  try {
    if (!props.tags) {
      return;
    }

    if (props.e && props.e.constructor.name.toLowerCase() !== 'axioserror') {
      console.log('************** API LOG **************');
      console.log(
        `${props.nameFunction} `,
        props.tags,
        ' error : ',
        JSON.stringify(props.e),
      );
      console.log('************** API LOG **************');
      return;
    }

    let url = '';
    let statusCode: any = 0;
    let body = JSON.stringify(props.body || '');
    let data = '';
    let isError = props.e ? 'error' : '';

    if (isError) {
      url = props.e?.request?._url || '';
      statusCode = props.e?.response?.status;
      body = props.e?.config?.data || '';
      data = JSON.stringify(props.e?.response?.data) || '';
    } else {
      url = props.res?.request?._url;
      statusCode = props.res?.status;
      data =
        JSON.stringify(props.res?.data?.data) ||
        JSON.stringify(props.res?.data);
    }

    console.log('************** API LOG **************');
    generateCurl({
      res: props.res || props.e,
      nameFunction: props.nameFunction,
      tags: props.tags,
      url,
      isError,
    });

    console.log(
      `${props.nameFunction}`,
      props.tags,
      isError,
      'statusCode :',
      statusCode,
      '\n',
    );

    console.log(
      `${props.nameFunction}`,
      props.tags,
      isError,
      'url :',
      url,
      '\n',
    );
    console.log(
      `${props.nameFunction}`,
      props.tags,
      isError,
      'body :',
      body,
      '\n',
    );

    console.log(
      `${props.nameFunction}`,
      props.tags,
      isError,
      'data :',
      data,
      '\n',
    );
    console.log('************** API LOG **************');
  } catch (error) {
    if (!props.tags) {
      return;
    }
    console.log('ERROR LOG API : ', error);
  }
};

const generateCurl = (props: GenerateCurlProps) => {
  try {
    if (!props.tags) {
      return;
    }

    if (!props.res?.config) {
      console.log(
        'Cant generate curl because props `res` is not an AxiosResponse',
      );
      return;
    }

    const { params, headers, data, method } = props.res?.config;
    let curlCommand = `curl --location "${props.url}"`;

    // Add request method
    curlCommand += ` --request ${method?.toUpperCase?.()}`;

    // Add headers
    for (const [key, value] of Object.entries(headers)) {
      curlCommand += ` --header "${key}: ${value}"`;
    }

    // Add query parameters
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      curlCommand += ` --data-urlencode "${queryParams}"`;
    }

    // Add request body
    if (data) {
      const requestBody = data;
      curlCommand += ` --data '${requestBody}'`;
    }

    console.log(
      props.nameFunction,
      props.tags,
      props.isError,
      'curl :',
      curlCommand,
    );
  } catch (error) {
    if (!props.tags) {
      return;
    }
    console.log('ERROR GENERATE CURL : ', error);
  }
};

export { logApi };
