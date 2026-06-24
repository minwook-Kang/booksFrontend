import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Fuse from "fuse.js";
import Filter from "badwords-ko";
import { getGenreErrorMessage, getGenres } from "../../../api/genreApi";
import { getGenreId, getGenreName } from "../../../utils/genreFormat";
import { useLockBodyScroll } from "../../../utils/useLockBodyScroll";
import "./GenreModal.css";

const normalizeGenre = (value = "") => {
  return value.trim().replace(/\s+/g, " ");
};

const normalizeForCompare = (value) => {
  return normalizeGenre(value)
    .toLowerCase()
    .replace(/[/&\s]/g, "");
};

const isDuplicateGenre = (newGenre, genres) => {
  const normalizedNewGenre = normalizeForCompare(newGenre);

  return genres.some((genre) => {
    return normalizeForCompare(getGenreName(genre)) === normalizedNewGenre;
  });
};

const isValidGenreText = (genre) => {
  return /^[가-힣a-zA-Z0-9/&\s]+$/.test(genre);
};

const isSameGenre = (selectedGenre, genre) => {
  const selectedName = getGenreName(selectedGenre);
  const genreName = getGenreName(genre);

  const selectedId = getGenreId(selectedGenre);
  const genreId = getGenreId(genre);

  if (selectedId && genreId) {
    return String(selectedId) === String(genreId);
  }

  return normalizeForCompare(selectedName) === normalizeForCompare(genreName);
};

function GenreModal({
  selectedGenre,
  onSelectGenre,
  onClose,
  allowCustomGenre = true,
  title = "장르 선택",
  description = "책의 분위기에 가장 가까운 장르를 골라주세요.",
}) {
  useLockBodyScroll(true);

  const [genres, setGenres] = useState([]);
  const [pendingGenres, setPendingGenres] = useState(() => {
    if (selectedGenre?.isNew) {
      return [selectedGenre];
    }

    return [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customGenre, setCustomGenre] = useState("");
  const [suggestedGenre, setSuggestedGenre] = useState("");

  const profanityFilter = useMemo(() => new Filter(), []);
  const allGenres = useMemo(
    () => [...genres, ...pendingGenres],
    [genres, pendingGenres]
  );
  const genreNames = useMemo(
    () => allGenres.map(getGenreName).filter(Boolean),
    [allGenres]
  );

  const fuse = useMemo(
    () =>
      new Fuse(genreNames, {
        threshold: 0.35,
        includeScore: true,
      }),
    [genreNames]
  );

  const fetchGenreList = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const data = await getGenres();
      setGenres(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setLoadError(getGenreErrorMessage(error, "장르 목록을 불러오지 못했습니다."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadInitialGenreList = async () => {
      try {
        const data = await getGenres();

        if (ignore) return;

        setGenres(Array.isArray(data) ? data : []);
        setLoadError("");
      } catch (error) {
        if (ignore) return;

        console.error(error);
        setLoadError(getGenreErrorMessage(error, "장르 목록을 불러오지 못했습니다."));
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadInitialGenreList();

    return () => {
      ignore = true;
    };
  }, []);

  const getSimilarGenre = (genre) => {
    const result = fuse.search(genre);

    if (!result.length) {
      return "";
    }

    const bestMatch = result[0];

    if (bestMatch.score <= 0.35) {
      return bestMatch.item;
    }

    return "";
  };

  const resetCustomForm = () => {
    setCustomGenre("");
    setSuggestedGenre("");
    setIsCustomOpen(false);
  };

  const handleGenreSelect = (genre) => {
    onSelectGenre({
      genreId: getGenreId(genre),
      name: getGenreName(genre),
      isNew: Boolean(genre?.isNew),
    });
  };

  const addPendingGenre = (genreName) => {
    const nextGenre = {
      genreId: null,
      name: genreName,
      isNew: true,
    };

    setPendingGenres((prevGenres) => {
      if (isDuplicateGenre(nextGenre.name, [...genres, ...prevGenres])) {
        return prevGenres;
      }

      return [...prevGenres, nextGenre];
    });

    toast.success("장르 버튼이 추가되었습니다. 추가된 장르를 선택해주세요.");
    resetCustomForm();
  };

  const handleCustomGenreAdd = () => {
    const trimmedGenre = normalizeGenre(customGenre);

    if (isLoading) {
      toast.error("장르 목록을 불러오는 중입니다.");
      return;
    }

    if (loadError) {
      toast.error("장르 목록을 먼저 불러와주세요.");
      return;
    }

    if (!trimmedGenre) {
      toast.error("장르를 입력해주세요.");
      return;
    }

    if (trimmedGenre.length > 12) {
      toast.error("장르는 12자 이하로 입력해주세요.");
      return;
    }

    if (!isValidGenreText(trimmedGenre)) {
      toast.error("장르에는 한글, 영문, 숫자, /, &, 공백만 사용할 수 있습니다.");
      return;
    }

    if (profanityFilter.isProfane(trimmedGenre)) {
      toast.error("부적절한 표현은 장르로 사용할 수 없습니다.");
      return;
    }

    if (isDuplicateGenre(trimmedGenre, allGenres)) {
      toast.error("이미 존재하는 장르입니다.");
      return;
    }

    const similarGenre = getSimilarGenre(trimmedGenre);

    if (similarGenre && normalizeForCompare(similarGenre) !== normalizeForCompare(trimmedGenre)) {
      setSuggestedGenre(similarGenre);
      return;
    }

    addPendingGenre(trimmedGenre);
  };

  const handleUseSuggestedGenre = () => {
    if (!suggestedGenre) return;

    const genre = allGenres.find((item) => {
      return normalizeForCompare(getGenreName(item)) === normalizeForCompare(suggestedGenre);
    });

    onSelectGenre({
      genreId: getGenreId(genre),
      name: suggestedGenre,
      isNew: Boolean(genre?.isNew),
    });
    resetCustomForm();
  };

  const handleUseCustomGenreAnyway = () => {
    const trimmedGenre = normalizeGenre(customGenre);

    addPendingGenre(trimmedGenre);
  };

  const handleCustomGenreKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomGenreAdd();
    }
  };

  const renderGenreList = () => {
    if (isLoading) {
      return (
        <div className="genre-modal-state" role="status">
          <span className="genre-modal-spinner" aria-hidden="true" />
          <p>장르 목록을 불러오는 중입니다.</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="genre-modal-state genre-modal-state-error" role="alert">
          {/* <strong>장르 목록 조회 실패</strong> */}
          <p>{loadError}</p>
          <button
            type="button"
            className="genre-modal-retry-button"
            onClick={fetchGenreList}
          >
            다시 불러오기
          </button>
        </div>
      );
    }

    if (!allGenres.length) {
      return (
        <div className="genre-modal-state">
          <p>등록된 장르가 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="genre-modal-list">
        {allGenres.map((genre) => {
          const genreName = getGenreName(genre);

          return (
            <button
              key={getGenreId(genre) ?? `new-${normalizeForCompare(genreName)}`}
              type="button"
              className={`genre-modal-item ${
                isSameGenre(selectedGenre, genre) ? "selected" : ""
              }`}
              onClick={() => handleGenreSelect(genre)}
            >
              {genreName}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="genre-modal-backdrop" onClick={onClose}>
      <div
        className="genre-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="genre-modal-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="genre-modal-close-button"
            onClick={onClose}
            aria-label="장르 선택 창 닫기"
          >
            ×
          </button>
        </div>

        <div className="genre-modal-content">
          {renderGenreList()}

          {allowCustomGenre && (
            <div className="genre-modal-custom-area">
              {!isCustomOpen && (
                <button
                  type="button"
                  className="genre-modal-custom-open-button"
                  disabled={isLoading || Boolean(loadError)}
                  onClick={() => setIsCustomOpen(true)}
                >
                  + 직접 장르 추가
                </button>
              )}

              {isCustomOpen && (
                <>
                  <div className="genre-modal-custom-form">
                    <input
                      className="genre-modal-custom-input"
                      value={customGenre}
                      onChange={(e) => {
                        setCustomGenre(e.target.value);
                        setSuggestedGenre("");
                      }}
                      onKeyDown={handleCustomGenreKeyDown}
                      placeholder="새 장르를 입력해주세요."
                      autoFocus
                    />

                    <button
                      type="button"
                      className="genre-modal-custom-add-button"
                      onClick={handleCustomGenreAdd}
                    >
                      추가
                    </button>
                  </div>

                  {suggestedGenre && (
                    <div className="genre-modal-suggestion">
                      <p>
                        혹시 <strong>{suggestedGenre}</strong> 장르를 의미하셨나요?
                      </p>

                      <div className="genre-modal-suggestion-actions">
                        <button
                          type="button"
                          onClick={handleUseSuggestedGenre}
                        >
                          {suggestedGenre} 선택
                        </button>

                        <button
                          type="button"
                          onClick={handleUseCustomGenreAnyway}
                        >
                          그대로 추가
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GenreModal;
