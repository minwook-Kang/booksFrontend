import { useCallback, useEffect, useState } from "react";
import {
  createReview,
  getBookRating,
  getReviewsByBookId,
  likeReview,
} from "../../api/reviewApi";
import { formatRating } from "../../utils/reviewFormat";
import { useLockBodyScroll } from "../../utils/useLockBodyScroll";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import "./ReviewSection.css";

/**
 * ReviewSection — 도서 상세 하단 리뷰 영역
 *
 * @param {number|string} bookId - 리뷰를 조회·등록할 대상 도서 ID
 */
function ReviewSection({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useLockBodyScroll(isModalOpen);

  const loadReviews = useCallback(async () => {
    if (!bookId) {
      setReviews([]);
      setAverageRating(0);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const [reviewList, rating] = await Promise.all([
        getReviewsByBookId(bookId),
        getBookRating(bookId),
      ]);

      setReviews(Array.isArray(reviewList) ? reviewList : []);
      setAverageRating(rating);
    } catch (error) {
      console.error(error);
      setErrorMessage("리뷰를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleCreateReview = async (formData) => {
    await createReview(bookId, formData);
    await loadReviews();
    setIsModalOpen(false);
  };

  const handleLikeReview = async (reviewId) => {
    const updatedReview = await likeReview(reviewId);

    setReviews((prev) =>
      (Array.isArray(prev) ? prev : []).map((review) => {
        if (review.reviewId !== reviewId) {
          return review;
        }

        if (updatedReview) {
          return updatedReview;
        }

        return { ...review, likeCount: review.likeCount + 1 };
      }),
    );
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const reviewCount = safeReviews.length;

  return (
    <section className="reviewSection" aria-labelledby="review-section-title">
      <div className="reviewSection-header">

        <div className="reviewSection-header-left">
        <h2 id="review-section-title" className="reviewSection-title">
          리뷰
        </h2>
        <span className="badge reviewSection-count">{reviewCount}</span>
        {reviewCount > 0 && (
          <span className="reviewSection-rating" aria-label="평균 별점">
            평균 {formatRating(averageRating)}
          </span>
        )}
        </div>
        <button 
          type="button" 
          className="reviewSection-writeBtn"
          onClick={() => setIsModalOpen(true)}
        >
          리뷰 작성
        </button>
      </div>

        
      <div className="reviewSection-body">

        {loading && (
          <p className="reviewSection-message">리뷰를 불러오는 중입니다.</p>
        )}

        {!loading && errorMessage && (
          <p className="reviewSection-message reviewSection-message--error">
            {errorMessage}
          </p>
        )}

        {!loading && !errorMessage && reviewCount > 0 ? (
          <ul className="reviewSection-list">
            {safeReviews.map((review) => (
              <li key={review.reviewId} className="reviewSection-listItem">
                <ReviewCard review={review} onLike={handleLikeReview} />
              </li>
            ))}
          </ul>
        ) : (
          !loading &&
          !errorMessage && (
            <p className="reviewSection-empty">아직 등록된 리뷰가 없습니다.</p>
          )
        )}
      </div>
        {isModalOpen && (
        <div 
          className="reviewForm-modalOverlay"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.45)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 1000,
            overscrollBehavior: "contain",
          }}
        >
          <div 
            className="reviewForm-modalBox"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%", maxWidth: "520px", backgroundColor: "#fff",
              padding: "24px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}
          >
            <ReviewForm onSubmit={handleCreateReview} onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}

    </section>
  );
}

export default ReviewSection;
