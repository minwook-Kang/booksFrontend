import { useState } from "react";
import BookImage from "./BookImage";
import { getGenreName } from "../../utils/genreFormat";
import "./BookCardStyle.css";

function BookCard({ book, onClick, onLike }) {
  const [likeBurstId, setLikeBurstId] = useState(0);
  const hasCoverImage = Boolean(book.coverImageUrl?.trim());
  const genreName = getGenreName(book.genre);
  const byline = [book.author, genreName].filter(Boolean).join(" · ");
  const viewCount = book.views || 0;
  const likeCount = book.likes || 0;
  const isLiked = Boolean(book.liked || book.isLiked || book.likedByMe);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setLikeBurstId((prev) => prev + 1);
    onLike?.(book.id);
  };

  return (
    <article className="book-card" onClick={() => onClick?.(book.id)}>
      <div className="book-card-cover-area">
        <div
          className={`book-cover-3d ${
            hasCoverImage ? "" : "book-cover-3d--placeholder"
          }`}
        >
          <div className="book-cover-front">
            {hasCoverImage ? (
              <BookImage src={book.coverImageUrl} alt={book.title} />
            ) : (
              <div
                className="book-cover-placeholder"
                role="img"
                aria-label={`${book.title} 표지 없음`}
              >
                <span>표지를 기다리는 책</span>
                <small>AI 표지를 생성해보세요</small>
              </div>
            )}

            {onLike ? (
              <button
                type="button"
                className={`book-like-button ${isLiked ? "is-liked" : ""}`}
                onClick={handleLikeClick}
                aria-label={`${book.title} 좋아요 ${likeCount}개`}
              >
                <span aria-hidden="true">{isLiked ? "♥" : "♡"}</span>
              </button>
            ) : (
              <span
                className="book-like-button book-like-button--readonly"
                aria-label={`좋아요 ${likeCount}개`}
              >
                <span aria-hidden="true">{isLiked ? "♥" : "♡"}</span>
              </span>
            )}
          </div>

          {likeBurstId > 0 && (
            <span key={likeBurstId} className="book-like-burst" aria-hidden="true">
              <span>♥</span>
              <span>♥</span>
              <span>♥</span>
              <span>♥</span>
              <span>♥</span>
            </span>
          )}
        </div>
      </div>

      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        {byline && <p className="book-card-byline">{byline}</p>}
        {book.content && <p className="book-card-desc">{book.content}</p>}

        <div className="book-card-meta">
          <span className="book-meta-pill" aria-label={`조회수 ${viewCount}`}>
            <span aria-hidden="true">👁</span>
            {viewCount}
          </span>
          <span
            className="book-meta-pill book-meta-pill--like"
            aria-label={`좋아요 ${likeCount}`}
          >
            <span aria-hidden="true">{isLiked ? "♥" : "♡"}</span>
            {likeCount}
          </span>
        </div>
      </div>
    </article>
  );
}

export default BookCard;
