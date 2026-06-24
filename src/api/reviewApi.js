import { parseErrorMessage, parseJsonResponse } from "./httpUtils";
import { API_BASE_URL, BOOKS_API_URL } from "./config";

const REVIEWS_BASE_URL = `${API_BASE_URL}/reviews`;

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

/** GET /books/{bookId}/reviews */
export const getReviewsByBookId = async (bookId) => {
  try {
    const res = await fetch(`${BOOKS_API_URL}/${bookId}/reviews`);

    if (!res.ok) {
      throw new Error("리뷰 목록 조회 실패");
    }

    const data = await parseJsonResponse(res);
    return data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

/** GET /books/{bookId}/reviews/rating */
export const getBookRating = async (bookId) => {
  try {
    const res = await fetch(`${BOOKS_API_URL}/${bookId}/reviews/rating`);

    if (!res.ok) {
      throw new Error("평균 별점 조회 실패");
    }

    const data = await parseJsonResponse(res);
    return data ?? 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

/** POST /books/{bookId}/reviews */
export const createReview = async (bookId, { content, rating }) => {
  const res = await fetch(`${BOOKS_API_URL}/${bookId}/reviews`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ content, rating }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "리뷰 작성에 실패했습니다."));
  }

  return await parseJsonResponse(res);
};

/** PATCH /reviews/{reviewId} */
export const updateReview = async (reviewId, { content, rating }) => {
  const res = await fetch(`${REVIEWS_BASE_URL}/${reviewId}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ content, rating }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "리뷰 수정에 실패했습니다."));
  }

  return await parseJsonResponse(res);
};

/** DELETE /reviews/{reviewId} */
export const deleteReview = async (reviewId) => {
  const res = await fetch(`${REVIEWS_BASE_URL}/${reviewId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "리뷰 삭제에 실패했습니다."));
  }

  return true;
};

/** PATCH /reviews/{reviewId}/like */
export const likeReview = async (reviewId) => {
  const res = await fetch(`${REVIEWS_BASE_URL}/${reviewId}/like`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "좋아요 처리에 실패했습니다."));
  }

  return await parseJsonResponse(res);
};
