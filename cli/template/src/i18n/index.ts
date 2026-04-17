import * as welcome from './welcome';

const loadedNameSpaces = {
  welcome,
};

export const defaultNameSpace: NameSpace = 'welcome';
export type SupportedLocale = 'en' | 'id';

export const defaultLanguage: SupportedLocale = 'en';
export const keySeparator = '.';

export type NameSpace = keyof typeof loadedNameSpaces;
type LoadedResources = { [locale in SupportedLocale]: Translation };

type Translation = { [key: string]: string | Translation };

type Translations = {
  [nameSpace in NameSpace]: Translation;
};

type I18nResource = {
  [locale in SupportedLocale]: Translations;
};

function adaptLoadedResources(
  inputResources: Record<string, Record<SupportedLocale, Translation>>,
): I18nResource {
  const flatResources = Object.entries(inputResources) as unknown as [
    NameSpace,
    LoadedResources,
  ][];
  return flatResources.reduce<I18nResource>(
    (accumulator, [nameSpace, locales]) => {
      const transformedLocales = Object.entries(locales) as [
        SupportedLocale,
        Translation,
      ][];
      transformedLocales.forEach(([locale, translation]) => {
        if (!accumulator[locale]) {
          accumulator[locale] = {} as typeof loadedNameSpaces;
        }

        accumulator[locale][nameSpace] = transformTranslation(translation);
      });

      return accumulator;
    },
    {} as I18nResource,
  );
}

function transformTranslation(translation: Translation): Translation {
  return Object.keys(translation).reduce<Translation>((acc, key) => {
    const formattedKey = key.split(':')[1]; // Remove namespace from key
    acc[formattedKey] =
      typeof translation[key] === 'object'
        ? transformTranslation(translation[key] as Translation)
        : translation[key];
    return acc;
  }, {});
}

type AllLoadedNameSpaceType = (typeof loadedNameSpaces)[NameSpace];
type AllLoadedNameSpaceTypeByLanguage =
  AllLoadedNameSpaceType[typeof defaultLanguage];
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type RecursiveKeyOf<TObj extends Record<string, unknown>> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends unknown[]
    ? `${TKey}`
    : TObj[TKey] extends Record<string, unknown>
    ? `${TKey}${typeof keySeparator}${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & (string | number)];

type FlattenTypedKey = UnionToIntersection<AllLoadedNameSpaceTypeByLanguage>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const resources: I18nResource = adaptLoadedResources(loadedNameSpaces);
export const nameSpaceNames = Object.keys(loadedNameSpaces) as NameSpace[];

// to type translation keys
export type TranslationKey = RecursiveKeyOf<FlattenTypedKey>;

export const nameSpaces: Record<NameSpace, NameSpace> = nameSpaceNames.reduce(
  (record, ns) => Object.assign(record, { [ns]: ns }),
  {} as Record<NameSpace, NameSpace>,
);
