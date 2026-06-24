import { parseErrorMessage, parseJsonResponse } from "./httpUtils";

const BASE_URL = "http://13.214.156.69:8080/books";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

/** GET /reviews/{reviewId}/feedback — 없으면 null */
export const getFeedbackByReviewId = async (reviewId) => {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/feedback`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "피드백 조회에 실패했습니다."));
  }

  const data = await parseJsonResponse(res);
  return data ?? null;
};

/** POST /reviews/{reviewId}/feedback */
export const createFeedback = async (reviewId, content) => {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/feedback`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ content }),
  });

  if (res.status === 409) {
    return getFeedbackByReviewId(reviewId);
  }

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "피드백 등록에 실패했습니다."));
  }

  const data = await parseJsonResponse(res);
  if (data) {
    return data;
  }

  return getFeedbackByReviewId(reviewId);
};

/** PATCH /feedbacks/{feedbackId} */
export const updateFeedback = async (feedbackId, content) => {
  const res = await fetch(`${BASE_URL}/feedbacks/${feedbackId}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "피드백 수정에 실패했습니다."));
  }

  return await parseJsonResponse(res);
};

/** DELETE /feedbacks/{feedbackId} */
export const deleteFeedback = async (feedbackId) => {
  const res = await fetch(`${BASE_URL}/feedbacks/${feedbackId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "피드백 삭제에 실패했습니다."));
  }

  return true;
};
