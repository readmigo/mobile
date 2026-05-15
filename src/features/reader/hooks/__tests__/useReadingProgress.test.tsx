import React, { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { useReadingProgress } from '../useReadingProgress';
import { booksApi } from '@/services/api/books';

jest.mock('@/services/api/books', () => ({
  booksApi: {
    getBooks: jest.fn(),
    getBookDetail: jest.fn(),
    searchBooks: jest.fn(),
    getCategories: jest.fn(),
    getUserLibrary: jest.fn(),
    addToLibrary: jest.fn(),
    removeFromLibrary: jest.fn(),
    updateReadingProgress: jest.fn(() => Promise.resolve({ data: {}, success: true })),
    getBookContent: jest.fn(),
    getRecentlyBrowsed: jest.fn(),
    getFavoriteBooks: jest.fn(),
    toggleFavorite: jest.fn(),
  },
}));

const mockedBooksApi = booksApi as jest.Mocked<typeof booksApi>;

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useReadingProgress', () => {
  it('flush sends current cfi + progress to api', async () => {
    const { result } = renderHook(
      () => useReadingProgress({ bookId: 'book-1' }),
      { wrapper: makeWrapper() }
    );

    act(() => {
      result.current.updateLocation('epubcfi(/6/4!/4/2)', 42);
    });

    await act(async () => {
      result.current.flush();
    });

    expect(mockedBooksApi.updateReadingProgress).toHaveBeenCalledWith({
      bookId: 'book-1',
      cfi: 'epubcfi(/6/4!/4/2)',
      progress: 0.42,
    });
  });

  it('does not save twice for the same cfi', async () => {
    const { result } = renderHook(
      () => useReadingProgress({ bookId: 'book-1' }),
      { wrapper: makeWrapper() }
    );

    act(() => {
      result.current.updateLocation('cfi-X', 10);
    });
    await act(async () => { result.current.flush(); });
    await act(async () => { result.current.flush(); });

    expect(mockedBooksApi.updateReadingProgress).toHaveBeenCalledTimes(1);
  });

  it('does not call api when bookId is missing', async () => {
    const { result } = renderHook(
      () => useReadingProgress({ bookId: undefined }),
      { wrapper: makeWrapper() }
    );

    act(() => result.current.updateLocation('cfi-Y', 5));
    await act(async () => { result.current.flush(); });

    expect(mockedBooksApi.updateReadingProgress).not.toHaveBeenCalled();
  });

  it('AppState background event triggers flush', async () => {
    let appStateHandler: (s: string) => void = () => {};
    const addListenerSpy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_evt, cb) => {
        appStateHandler = cb as (s: string) => void;
        return { remove: jest.fn() } as any;
      });

    const { result } = renderHook(
      () => useReadingProgress({ bookId: 'book-1' }),
      { wrapper: makeWrapper() }
    );

    act(() => result.current.updateLocation('cfi-Z', 80));
    await act(async () => { appStateHandler('background'); });

    expect(mockedBooksApi.updateReadingProgress).toHaveBeenCalledWith({
      bookId: 'book-1',
      cfi: 'cfi-Z',
      progress: 0.8,
    });

    addListenerSpy.mockRestore();
  });
});
