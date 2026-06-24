import { useEffect, useState } from "react";
import {
  BookCreate,
  BookDetail,
  BookUpdate,
  BookDelete,
} from "../api/bookApi";
import {
  createGenre,
  getGenreErrorMessage,
  isGenreAlreadyExistsError,
} from "../api/genreApi";
import { toast } from "react-hot-toast";

import Header from "../components/Header";
import BookForm from "../components/Form/Book/BookForm";
import { getGenreId, getGenreName } from "../utils/genreFormat";
import "./BookDetailPage.css";

const INITIAL_BOOK_DATA = {
  title: "",
  author: "",
  genre: "",
  genreId: null,
  isNewGenre: false,
  content: "",
  coverImageUrl: "",
  views: 0,
  likes: 0
};

const GENRE_CREATE_SETTLE_DELAY_MS = 300;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function BookDetailPage({
  mode,
  bookId,
  onGoList,
  onGoRegister,
  isDarkMode,
  onToggleTheme,
}) {
  const isCreate = mode === "create";

  const [bookData, setBookData] = useState(INITIAL_BOOK_DATA);
  const [pageLoading, setPageLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [genreFeedback, setGenreFeedback] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toastPosition = isMobile ? "bottom-center" : "top-right";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isCreate || !bookId) {
      let ignore = false;

      queueMicrotask(() => {
        if (!ignore) {
          setBookData(INITIAL_BOOK_DATA);
          setGenreFeedback(null);
        }
      });

      return () => {
        ignore = true;
      };
    }

    let ignore = false;

    const fetchBookDetail = async () => {
      try {
        setPageLoading(true);

        const data = await BookDetail(bookId);

        if (ignore) return;

        if (!data) {
          toast.error("도서 정보를 불러오지 못했습니다.", {
            id: "book-detail-empty",
            position: toastPosition,
          });
          return;
        }

        const genreValue = getGenreName(data.genre) || data.genre;
        const genreId = getGenreId(data.genre) ?? data.genreId;

        setBookData({
          title: data.title || "",
          author: data.author || "",
          genre: genreValue || "",
          genreId: genreId ?? null,
          isNewGenre: false,
          content: data.content || "",
          coverImageUrl: data.coverImageUrl || "",
          views: data.views || 0,
          likes: data.likes || 0,
        });
      } catch (error) {
        if (ignore) return;

        console.error(error);
        toast.error("도서 상세 정보를 불러오는 중 오류가 발생했습니다.", {
          id: "book-detail-fetch-error",
          position: toastPosition,
        });
      } finally {
        if (!ignore) {
          setPageLoading(false);
        }
      }
    };

    fetchBookDetail();

    return () => {
      ignore = true;
    };
  }, [isCreate, bookId, toastPosition]);

  const handleSave = async () => {
    if (isSaving) return;

    if (
      !bookData.title.trim() ||
      !bookData.author.trim() ||
      !bookData.content.trim()
    ) {
      toast.error("제목, 저자, 내용을 모두 입력해주세요.", {
        position: toastPosition,
      });
      return;
    }

    const selectedGenreName = bookData.genre?.trim() || "";

    if (!selectedGenreName) {
      setGenreFeedback({
        type: "error",
        title: "장르 선택 필요",
        message: "도서를 등록하려면 먼저 장르를 선택해주세요.",
      });
      toast.error("장르를 선택해주세요.", {
        position: toastPosition,
      });
      return;
    }

    setIsSaving(true);
    setGenreFeedback(null);

    try {
      let createdGenre = null;
      let selectedGenreId = bookData.genreId ?? null;
      let genreName = selectedGenreName;

      if (bookData.isNewGenre) {
        try {
          setGenreFeedback({
            type: "info",
            title: "새 장르 추가 중",
            message: `"${selectedGenreName}" 장르를 먼저 서버에 등록하고 있습니다.`,
          });

          createdGenre = await createGenre(selectedGenreName);
          selectedGenreId = getGenreId(createdGenre);
          genreName = getGenreName(createdGenre) || selectedGenreName;

          if (!selectedGenreId) {
            setGenreFeedback({
              type: "error",
              title: "장르 추가 응답 오류",
              message: "서버에서 새 장르 ID를 내려주지 않았습니다.",
            });
            toast.error("새 장르 정보를 확인할 수 없습니다.", {
              position: toastPosition,
            });
            return;
          }

          setBookData((prev) => ({
            ...prev,
            genre: genreName,
            genreId: selectedGenreId,
            isNewGenre: false,
          }));

          setGenreFeedback({
            type: "success",
            title: "새 장르 추가 완료",
            message: `"${genreName}" 장르가 등록되었습니다. 도서를 이어서 저장합니다.`,
          });

          await wait(GENRE_CREATE_SETTLE_DELAY_MS);
        } catch (error) {
          console.error(error);

          if (isGenreAlreadyExistsError(error)) {
            setGenreFeedback({
              type: "error",
              title: "중복 장르",
              message: "이미 존재하는 장르입니다. 장르 선택 창을 다시 열어 목록에서 선택해주세요.",
            });
            toast.error("이미 존재하는 장르입니다. 장르 목록에서 다시 선택해주세요.", {
              position: toastPosition,
            });
            return;
          }

          const genreErrorMessage = getGenreErrorMessage(
            error,
            "새 장르 추가에 실패했습니다."
          );

          setGenreFeedback({
            type: "error",
            title: "새 장르 추가 실패",
            message: genreErrorMessage,
          });

          toast.error(genreErrorMessage, {
            position: toastPosition,
          });
          return;
        }
      }

      if (selectedGenreId === null || selectedGenreId === undefined || selectedGenreId === "") {
        setGenreFeedback({
          type: "error",
          title: "장르 ID 없음",
          message: "선택한 장르의 ID를 확인할 수 없습니다. 장르 목록에서 다시 선택해주세요.",
        });
        toast.error("장르 목록에서 장르를 다시 선택해주세요.", {
          position: toastPosition,
        });
        return;
      }

      const bookPayload = {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        genreId: Number(selectedGenreId),
        content: bookData.content.trim(),
        coverImageUrl: bookData.coverImageUrl || "",
      };

      if (isCreate) {
        const createdBook = await BookCreate({
          ...bookPayload,
          views: 0,
          likes: 0,
        });

        if (!createdBook) {
          toast.error("도서 등록에 실패했습니다.", {
            position: toastPosition,
          });
          return;
        }

        toast.success(
          createdGenre
            ? "새 장르와 도서가 성공적으로 등록되었습니다."
            : "도서가 성공적으로 등록되었습니다.",
          {
            position: toastPosition,
          }
        );
        onGoList();
        return;
      }

      const updatedBook = await BookUpdate(bookId, {
        ...bookPayload,
        views: bookData.views || 0,
      });

      if (!updatedBook) {
        toast.error("도서 수정에 실패했습니다.", {
          position: toastPosition,
        });
        return;
      }

      toast.success(
        createdGenre
          ? "새 장르가 추가되고 도서 정보가 수정되었습니다."
          : "도서 정보가 수정되었습니다.",
        {
          position: toastPosition,
        }
      );
      onGoList();
    } catch (error) {
      console.error(error);
      toast.error("서버 통신 중 오류가 발생했습니다.", {
        position: toastPosition,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    if (isCreate || !bookId) return;

    try {
      const success = await BookDelete(bookId);

      if (!success) {
        toast.error("도서 삭제에 실패했습니다.", {
          position: toastPosition,
        });
        return;
      }

      toast.success("도서가 삭제되었습니다.", {
        position: toastPosition,
      });
      onGoList();
    } catch (error) {
      console.error(error);
      toast.error("삭제 중 서버 오류가 발생했습니다.", {
        position: toastPosition,
      });
    }
  };

  const handleDelete = () => {
    if (isCreate || !bookId) return;

    toast(
      (t) => (
        <div
          className="custom-confirm-toast"
          style={{
            backgroundColor: isDarkMode ? "#1F2937" : "#ffffff",
            color: isDarkMode ? "#F3F4F6" : "#1F2937",
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            이 도서를 정말 삭제할까요?
          </p>

          <p
            style={{
              fontSize: "12px",
              color: "#888",
              margin: "0 0 14px 0",
            }}
          >
            삭제된 데이터는 복구할 수 없습니다.
          </p>

          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: "6px 12px",
                backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
                color: isDarkMode ? "#F3F4F6" : "#1F2937",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              취소
            </button>

            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                await executeDelete();
              }}
              style={{
                padding: "6px 12px",
                backgroundColor: "#E53E3E",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              삭제하기
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: toastPosition,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          margin: isMobile ? "0 0 20px 0" : "0",
        },
      }
    );
  };

  return (
    <div className="bookDetailPage">
      <Header
        title="걷기가 서재"
        onGoList={onGoList}
        onGoCreate={onGoRegister}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      <main className="bookDetailPage-main">
        {pageLoading && (
          <p className="bookDetailPage-message">
            도서 정보를 불러오는 중입니다.
          </p>
        )}

        {!pageLoading && (
          <>
            <section className="bookDetailPage-column bookDetailPage-column--flow">
              <BookForm
                key={isCreate ? "create-book-form" : `edit-book-form-${bookId}`}
                isCreate={isCreate}
                bookId={bookId}
                bookData={bookData}
                setBookData={setBookData}
                onSave={handleSave}
                onDelete={handleDelete}
                isSaving={isSaving}
                genreFeedback={genreFeedback}
                onClearGenreFeedback={() => setGenreFeedback(null)}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default BookDetailPage;
