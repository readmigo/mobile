import { TextStyle } from 'react-native';

export const typography = {
  // iOS HIG Typography Scale
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  } as TextStyle,

  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  } as TextStyle,

  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  } as TextStyle,

  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
  } as TextStyle,

  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,

  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
  } as TextStyle,

  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400',
  } as TextStyle,

  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,

  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  } as TextStyle,

  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  } as TextStyle,

  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400',
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
