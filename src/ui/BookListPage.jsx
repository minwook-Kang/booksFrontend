// 도서 목록 페이지
import { useEffect, useState } from "react";
import { BookLikeCount, BookList, BookSearch } from "../api/bookApi";
import { getBooksByGenre, getGenreErrorMessage } from "../api/genreApi";

import Header from "../components/Header";
import BookCard from "../components/bookCard/BookCard";
import BookImage from "../components/bookCard/BookImage";
import GenreSelector from "../components/Form/Book/GenreSelector";
import MainButton from "../components/comButton/MainButton";
import { getGenreId, getGenreName } from "../utils/genreFormat";
import "./BookListPage.css";

const hasCoverImage = (book) => Boolean(book?.coverImageUrl?.trim());

const getShelfMeta = (book) => {
  const genreName = getGenreName(book?.genre);
  const meta = [book?.author, genreName].filter(Boolean).join(" · ");

  return meta || "새 이야기";
};

function BookListPage({
  onGoList,
  onGoRegister,
  onGoDetail,
  isDarkMode,
  onToggleTheme,
}) {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [sortType, setSortType] = useState("latest");
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [listMessage, setListMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchBooks = async () => {
      const data = await BookList();

      if (!ignore) {
        setBooks(Array.isArray(data) ? data : []);
        setListMessage("");
      }
    };

    fetchBooks();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = async () => {
    const data = await BookSearch(keyword);
    setSelectedGenre(null);
    setBooks(Array.isArray(data) ? data : []);
    setListMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLike = async (bookId) => {
    const likedBook = await BookLikeCount(bookId);

    if (!likedBook) return;

    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === bookId
          ? { ...book, likes: likedBook.likes ?? (book.likes || 0) + 1 }
          : book
      )
    );
  };

  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    setKeyword("");
    const genreId = getGenreId(genre);

    if (!genreId) {
      const data = await BookList();
      setBooks(Array.isArray(data) ? data : []);
      setListMessage("");
      return;
    }

    try {
      const data = await getBooksByGenre(genreId);
      setBooks(Array.isArray(data) ? data : []);
      setListMessage("");
    } catch (error) {
      console.error(error);
      setBooks([]);
      setListMessage(
        getGenreErrorMessage(error, "장르별 도서 목록을 불러오지 못했습니다.")
      );
    }
  };

  const handleGenreClear = () => {
    handleGenreSelect(null);
  };

  const sortedBooks = [...books].sort((a, b) => {
    if (sortType === "latest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortType === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sortType === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortType === "view") {
      return (b.views || 0) - (a.views || 0);
    }

    return 0;
  });

  const recentBooks = sortedBooks.slice(0, 6);

  return (
    <div className="book-list-page">
      <Header
        title="걷기가 서재"
        onGoList={onGoList}
        onGoCreate={onGoRegister}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      <main className="book-list-main">
        <section className="book-list-hero">
          <div>
            <span className="book-list-hero-kicker">AI Cover Library</span>
            <h1>책잎이 자라는 서재</h1>
            <p>등록한 이야기와 AI가 만든 표지를 모아 나만의 책장을 완성해보세요.</p>
          </div>
          <div className="book-list-hero-stats" aria-label="도서 목록 요약">
            <strong>{books.length}</strong>
            <span>등록된 책</span>
          </div>
        </section>

        <section className="book-list-toolbar" aria-label="도서 검색과 필터">
          <div className="book-list-search">
            <input
              type="text"
              className="book-list-search-input"
              placeholder="도서 제목, 저자, 내용으로 검색하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="book-list-search-button">
              <MainButton onClick={handleSearch}>검색</MainButton>
            </div>
          </div>

          <div className="book-list-actions">
            <div
              className={`book-list-genre-filter ${selectedGenre ? "is-selected" : ""}`}
            >
              <GenreSelector
                selectedGenre={selectedGenre}
                onSelectGenre={handleGenreSelect}
                allowCustomGenre={false}
                modalTitle="조회할 장르 선택"
                modalDescription="보고 싶은 장르를 선택하면 해당 장르의 도서만 모아 보여드려요."
                className="book-list-genre-button"
              />
              {selectedGenre && (
                <button
                  type="button"
                  className="book-list-genre-clear"
                  onClick={handleGenreClear}
                  aria-label={`${selectedGenre.name} 장르 필터 해제`}
                >
                  ×
                </button>
              )}
            </div>

            <label className="book-list-sort">
              <span>정렬</span>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="title">제목순</option>
                <option value="view">조회수순</option>
              </select>
            </label>

            <div className="book-list-register-button">
              <MainButton onClick={onGoRegister}>+ 새 책 등록</MainButton>
            </div>
          </div>
        </section>

        <section className="book-shelf" aria-labelledby="recent-books-title">
          <div className="book-list-section-heading">
            <span>Recently Added</span>
            <h2 id="recent-books-title">최근 등록된 이야기</h2>
          </div>

          {recentBooks.length === 0 ? (
            <p className="book-list-empty book-list-empty--shelf">
              표지를 올릴 책을 기다리고 있어요.
            </p>
          ) : (
            <div className="book-shelf-track">
              {recentBooks.map((book, index) => (
                <button
                  key={book.id}
                  type="button"
                  className={`book-shelf-item ${index === 0 ? "is-featured" : ""}`}
                  onClick={() => onGoDetail?.(book.id)}
                >
                  <span
                    className={`book-cover-3d ${
                      hasCoverImage(book) ? "" : "book-cover-3d--placeholder"
                    }`}
                  >
                    {hasCoverImage(book) ? (
                      <span className="book-cover-front">
                        <BookImage src={book.coverImageUrl} alt={book.title} />
                      </span>
                    ) : (
                      <span className="book-cover-front">
                        <span
                          className="book-cover-placeholder"
                          role="img"
                          aria-label={`${book.title} 표지 없음`}
                        >
                          <span>표지를 기다리는 책</span>
                          <small>AI 표지를 생성해보세요</small>
                        </span>
                      </span>
                    )}
                  </span>
                  <span className="book-shelf-title">{book.title}</span>
                  <span className="book-shelf-meta">{getShelfMeta(book)}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="book-list-all" aria-labelledby="all-books-title">
          <div className="book-list-section-heading">
            <span>All Books</span>
            <h2 id="all-books-title">전체 도서</h2>
          </div>

          {books.length === 0 ? (
            <p className="book-list-empty">
              {listMessage ||
                (selectedGenre
                  ? `${selectedGenre.name} 장르에 등록된 도서가 없습니다.`
                  : "검색 결과가 없습니다.")}
            </p>
          ) : (
            <div className="book-grid">
              {sortedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={onGoDetail}
                  onLike={handleLike}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default BookListPage;
