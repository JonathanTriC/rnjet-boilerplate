import {
  useTranslation,
  UseTranslationOptions,
  UseTranslationResponse,
} from 'react-i18next';
import { NameSpace, TranslationKey } from '@i18n';
import { i18n, TOptions, TFunction, Namespace } from 'i18next';

type TypedNameSpaceOptions = TOptions & { ns?: NameSpace; count?: number };
export type TypedTranslationOptions =
  | string
  | TypedNameSpaceOptions
  | undefined;

type TFunctionParams<N extends Namespace> = Parameters<TFunction<N, undefined>>;

type UseTypedTranslationResponse<N extends Namespace> = {
  translate: (
    key: TranslationKey,
    options?: TypedTranslationOptions,
    defaultValue?: TFunctionParams<N>[1],
  ) => string;
  i18n: i18n;
  ready: boolean;
};

export function useTypedTranslation<N extends Namespace>(
  ns?: N,
  options?: UseTranslationOptions<undefined>,
): UseTypedTranslationResponse<N> {
  const response: UseTranslationResponse<NameSpace, undefined> = useTranslation(
    ns,
    options,
  );

  function privateT(
    key: TranslationKey,
    options?: TypedTranslationOptions,
    defaultValue?: TFunctionParams<N>[1],
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return response.t(key, defaultValue, options);
  }

  return {
    ...response,
    translate: privateT,
  };
}
