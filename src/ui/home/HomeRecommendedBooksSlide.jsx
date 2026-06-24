import BookCard from "../../components/bookCard/BookCard";
import { RECOMMENDED_BOOKS_COPY } from "./homeContent";

function HomeRecommendedBooksSlide({
  isActive,
  books,
  isLoading,
  onGoDetail,
}) {
  const safeBooks = Array.isArray(books) ? books : [];
  const recommendedBook = safeBooks[0];

  return (
    <article
      className="homePage-slide homePage-recommendSlide"
      aria-hidden={!isActive}
    >
      {isLoading ? (
        <p className="homePage-bookMessage">추천 도서를 불러오는 중입니다.</p>
      ) : recommendedBook ? (
        <>
          <div className="homePage-featureBookCard">
            <span className="homePage-bookRank">TOP 1</span>
            <BookCard book={recommendedBook} onClick={onGoDetail} />
          </div>

          <div className="homePage-featureBookText">
            <span className="homePage-eyebrow">
              {RECOMMENDED_BOOKS_COPY.eyebrow}
            </span>
            <h2 className="homePage-title">{RECOMMENDED_BOOKS_COPY.title}</h2>
            <p className="homePage-desc">{RECOMMENDED_BOOKS_COPY.description}</p>

            <div className="homePage-featureBookInfo">
              <strong>{recommendedBook.title}</strong>
              <p>{recommendedBook.content}</p>
              {recommendedBook.genre && (
                <div className="homePage-featureBookMeta">
                  <span>{recommendedBook.genre}</span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="homePage-bookMessage">아직 추천할 도서가 없습니다.</p>
      )}
    </article>
  );
}

export default HomeRecommendedBooksSlide;
