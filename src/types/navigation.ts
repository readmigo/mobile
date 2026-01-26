export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'book/[id]': { id: string };
  'book/reader': { bookId: string };
};

export type AuthStackParamList = {
  login: undefined;
  onboarding: undefined;
};

export type TabParamList = {
  library: undefined;
  discover: undefined;
  learn: undefined;
  profile: undefined;
};
