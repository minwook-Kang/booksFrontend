import { BOOKS_API_URL } from "./config";

const GENRE_BASE_URL = `${BOOKS_API_URL}/genres`;

export class GenreApiError extends Error {
  constructor(message, { status, code, payload } = {}) {
    super(message);
    this.name = "GenreApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

export const isNetworkError = (error) => {
  return (
    error instanceof TypeError ||
    error?.message === "Failed to fetch" ||
    error?.message === "NetworkError when attempting to fetch resource."
  );
};

const parseErrorPayload = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

const getErrorCode = (payload) => {
  return payload?.code || payload?.errorCode || payload?.error || "";
};

const getErrorMessage = (payload, fallback) => {
  return payload?.message || payload?.errorMessage || payload?.error || fallback;
};

const requestJson = async (url, options = {}, fallbackMessage) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const payload = await parseErrorPayload(response);

    throw new GenreApiError(getErrorMessage(payload, fallbackMessage), {
      status: response.status,
      code: getErrorCode(payload),
      payload,
    });
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

export const getGenres = async () => {
  return await requestJson(GENRE_BASE_URL, {}, "장르 목록 조회 실패");
};

export const createGenre = async (name) => {
  return await requestJson(
    GENRE_BASE_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name.trim() }),
    },
    "장르 추가 실패"
  );
};

export const getBooksByGenre = async (genreId) => {
  return await requestJson(
    `${GENRE_BASE_URL}/${genreId}/books`,
    {},
    "장르별 도서 조회 실패"
  );
};

export const isGenreAlreadyExistsError = (error) => {
  const payloadText = JSON.stringify(error?.payload || {});

  return (
    error?.status === 409 ||
    error?.code === "GENRE_ALREADY_EXISTS" ||
    payloadText.includes("GENRE_ALREADY_EXISTS")
  );
};

export const getGenreErrorMessage = (error, fallbackMessage) => {
  if (isNetworkError(error)) {
    return "서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.";
  }

  if (isGenreAlreadyExistsError(error)) {
    return "이미 존재하는 장르입니다. 장르 목록에서 다시 선택해주세요.";
  }

  if (error?.status === 400) {
    return error.message || "장르 입력 값을 확인해주세요.";
  }

  if (error?.status >= 500) {
    return "서버에서 장르를 처리하는 중 오류가 발생했습니다.";
  }

  return error?.message || fallbackMessage;
};

export const GenreList = getGenres;
export const GenreCreate = createGenre;
export const GenreBooks = getBooksByGenre;
