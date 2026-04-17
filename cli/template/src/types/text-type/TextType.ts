type FontSize = '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

type FontWeight = 'light' | 'regular' | 'bold';

export type Text = `${FontWeight}-${FontSize}`;

export type TextType<T> = { [K in Text]: T };
