const BASE_URL = "http://13.214.156.69:8080/books";
const OLD_BOOK_LIKES_STORAGE_KEY = "bookLikes";
const inFlightRequests = new Map();

if (typeof localStorage !== "undefined") {
  localStorage.removeItem(OLD_BOOK_LIKES_STORAGE_KEY);
}

const requestOnce = (key, request) => {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = request().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
};

const readJsonSafely = async (res) => {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// 목록 조회: GET /books
export const BookList = async () => {
  return requestOnce("GET /books", async () => {
    try {
      const res = await fetch(BASE_URL);

      if (!res.ok) {
        throw new Error("목록 조회 실패");
      }

      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  });
};

// 상세 조회: GET /books/{id}
export const BookDetail = async (id) => {
  return requestOnce(`GET /books/${id}`, async () => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`);

      if (!res.ok) {
        throw new Error("상세 조회 실패");
      }

      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  });
};

// 도서 등록: POST /books
export const BookCreate = async (book) => {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });

    if (!res.ok) {
      throw new Error("도서 등록 실패");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

// 도서 수정: PATCH /books/{id}
export const BookUpdate = async (id, book) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });

    if (!res.ok) {
      throw new Error("도서 수정 실패");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

// 도서 삭제: DELETE /books/{id}
export const BookDelete = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("도서 삭제 실패");
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 도서 키워드 검색: GET /books/search?q={keyword}
export const BookSearch = async (keyword) => {
  try {
    if (!keyword || !keyword.trim()) {
      return await BookList();
    }

    const trimmedKeyword = encodeURIComponent(keyword.trim());
    const res = await fetch(`${BASE_URL}/search?q=${trimmedKeyword}`);

    if (!res.ok) {
      throw new Error("도서 검색 실패");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 도서 조회수: PATCH /books/{id}/views
export const BookViewCount = async (id) => {
  return requestOnce(`PATCH /books/${id}/views`, async () => {
    try {
      const res = await fetch(`${BASE_URL}/${id}/views`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("조회수 증가 실패");
      }

      return await res.json();
    } catch (error) {
      console.error(error);
    }
  });
};

// 도서 좋아요: 서버 DB에 저장된 응답값을 그대로 사용
export const BookLikeCount = async (id) => {
  for (const path of ["likes", "like"]) {
    try {
      const res = await fetch(`${BASE_URL}/${id}/${path}`, {
        method: "PATCH",
      });

      if (res.ok) {
        return await readJsonSafely(res);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const currentBook = await BookDetail(id);
  const nextLikes = (currentBook?.likes || 0) + 1;

  return await BookUpdate(id, {
    likes: nextLikes,
  });
};

export const BookCoverUpdate = async (id, coverImageUrl) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: coverImageUrl }),
    });

    if (!res.ok) {
      throw new Error("AI 표지 저장 실패");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
  }
};
