import { useEffect, useRef, useState } from "react";
import Input from "../../common/Input";
import MainButton from "../../comButton/MainButton";
import BookImage from "../../bookCard/BookImage";
import ImageForm from "../AiImage/ImageForm";
import GenreSelector from "./GenreSelector";
import { getGenreId, getGenreName } from "../../../utils/genreFormat";
import "./BookFormStyle.css";

const CREATE_STEPS = [
  { id: 1, label: "기본 정보" },
  { id: 2, label: "이야기 입력" },
  { id: 3, label: "AI 표지 생성" },
  { id: 4, label: "최종 등록" },
];

const EDIT_STEPS = [
  { id: 1, label: "기본 정보" },
  { id: 2, label: "이야기 입력" },
  { id: 3, label: "표지" },
  { id: 4, label: "저장 영역" },
];

const getContentPreview = (content = "") => {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return "아직 입력된 내용이 없습니다.";
  }

  if (trimmedContent.length <= 120) {
    return trimmedContent;
  }

  return `${trimmedContent.slice(0, 120)}...`;
};

function BookForm({
  isCreate,
  bookId,
  bookData,
  setBookData,
  onSave,
  onDelete,
  isSaving = false,
  genreFeedback = null,
  onClearGenreFeedback,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(isCreate ? 1 : 4);
  const [coverStepCompleted, setCoverStepCompleted] = useState(!isCreate);

  const basicInfoRef = useRef(null);
  const contentRef = useRef(null);
  const coverRef = useRef(null);
  const previewRef = useRef(null);

  const selectedGenre = bookData.genre
    ? {
        genreId: bookData.genreId ?? null,
        name: bookData.genre,
        isNew: Boolean(bookData.isNewGenre),
      }
    : null;
  const steps = isCreate ? CREATE_STEPS : EDIT_STEPS;
  const isBasicInfoComplete = Boolean(
    bookData.title?.trim() && bookData.author?.trim() && bookData.genre?.trim(),
  );
  const isStoryComplete = Boolean(bookData.content?.trim());
  const isCoverComplete = Boolean(bookData.coverImageUrl) || coverStepCompleted;
  const contentPreview = getContentPreview(bookData.content);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBookData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreSelect = (genre) => {
    const genreName = getGenreName(genre);
    const genreId = getGenreId(genre);
    const isNewGenre = typeof genre === "string" ? false : Boolean(genre?.isNew);

    setBookData((prev) => ({
      ...prev,
      genre: genreName,
      genreId,
      isNewGenre,
    }));

    onClearGenreFeedback?.();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave();
  };

  const getStepRef = (step) => {
    if (step === 1) return basicInfoRef;
    if (step === 2) return contentRef;
    if (step === 3) return coverRef;
    return previewRef;
  };

  const moveToStep = (step) => {
    setCurrentStep(step);

    if (isCreate) {
      setMaxUnlockedStep((prevStep) => Math.max(prevStep, step));
    }

    setTimeout(() => {
      getStepRef(step).current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleBasicNext = () => {
    if (!isBasicInfoComplete) return;

    moveToStep(2);
  };

  const handleStoryNext = () => {
    if (!isStoryComplete) return;

    moveToStep(3);
  };

  const handleSkipCover = () => {
    setCoverStepCompleted(true);
    moveToStep(4);
  };

  const handleCoverGenerated = () => {
    setCoverStepCompleted(true);

    if (isCreate) {
      moveToStep(4);
    }
  };

  const isStepVisible = (step) => {
    return !isCreate || step <= maxUnlockedStep;
  };

  const isStepAvailable = (step) => {
    return !isCreate || step <= maxUnlockedStep;
  };

  const isStepCompleted = (step) => {
    if (step === 1) return isBasicInfoComplete;
    if (step === 2) return isStoryComplete;
    if (step === 3) return isCoverComplete;

    return false;
  };

  const getStepCardClassName = (step, extraClassName = "") => {
    return [
      "book-step-card",
      currentStep === step ? "active" : "",
      isStepCompleted(step) ? "completed" : "",
      extraClassName,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const renderStepHeader = (step, title, description) => (
    <div className="book-step-card-header">
      <span className="book-step-card-badge">Step {step}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );

  useEffect(() => {
    const stepEntries = [
      [1, basicInfoRef.current],
      [2, contentRef.current],
      [3, coverRef.current],
      [4, previewRef.current],
    ].filter(([, element]) => element);

    if (!stepEntries.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        const visibleStep = Number(visibleEntry.target.dataset.bookStep);

        if (visibleStep) {
          setCurrentStep(visibleStep);
        }
      },
      {
        rootMargin: "-32% 0px -52% 0px",
        threshold: [0.08, 0.24, 0.48],
      },
    );

    stepEntries.forEach(([, element]) => observer.observe(element));

    return () => observer.disconnect();
  }, [maxUnlockedStep]);


  return (
    <div
      className={`book-form book-flow-form ${
        isCreate ? "book-form--create" : "book-form--edit"
      }`}
    >
      <div className="book-flow-hero">
        <span className="book-flow-kicker">
          {isCreate ? "새 책 만들기" : "도서 편집"}
        </span>
        <h2 className="book-form-title">
          {isCreate ? "책을 한 단계씩 완성해볼까요?" : "도서 정보를 정돈해볼까요?"}
        </h2>
        <p className="book-flow-subtitle">
          {isCreate
            ? "기본 정보부터 표지와 최종 미리보기까지 자연스럽게 이어집니다."
            : "필요한 섹션으로 바로 이동해 빠르게 수정할 수 있습니다."}
        </p>
      </div>

      {!isCreate && <p className="book-form-id">기존 도서 ID: {bookId}</p>}

      <div className="book-flow-workspace">
        <nav className="book-stepper" aria-label="도서 입력 단계">
          {steps.map((step, index) => {
            const isAvailable = isStepAvailable(step.id);
            const isCompleted = isStepCompleted(step.id);

            return (
              <div className="book-stepper-item" key={step.id}>
                <button
                  type="button"
                  className={[
                    "book-stepper-button",
                    currentStep === step.id ? "active" : "",
                    isCompleted ? "completed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => isAvailable && moveToStep(step.id)}
                  disabled={!isAvailable}
                  aria-current={currentStep === step.id ? "step" : undefined}
                >
                  <span className="book-stepper-number">
                    {isCompleted ? "✓" : step.id}
                  </span>
                  <span className="book-stepper-label">{step.label}</span>
                </button>

                {index < steps.length - 1 && (
                  <span className="book-stepper-connector" aria-hidden="true">
                    ↓
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="book-form-body">
        {isStepVisible(1) && (
          <section
            ref={basicInfoRef}
            data-book-step="1"
            className={getStepCardClassName(1, "book-flow-basic-card")}
          >
            {renderStepHeader(
              1,
              "기본 정보",
              "책의 첫인상이 되는 제목, 저자, 장르를 정합니다.",
            )}

            <div className="book-flow-fields">
              <div className="book-form-title-field">
                <label className="book-form-title-label" htmlFor="book-title">
                  제목
                </label>

                <div className="book-form-title-row">
                  <Input
                    id="book-title"
                    name="title"
                    value={bookData.title}
                    onChange={handleChange}
                    placeholder="여러분의 책 제목을 입력해주세요."
                  />
                  <GenreSelector
                    selectedGenre={selectedGenre}
                    onSelectGenre={handleGenreSelect}
                  />
                </div>
              </div>

              {genreFeedback?.message && (
                <div
                  className={`book-form-genre-feedback ${
                    genreFeedback.type || "info"
                  }`}
                  role={genreFeedback.type === "error" ? "alert" : "status"}
                >
                  <strong>{genreFeedback.title}</strong>
                  <p>{genreFeedback.message}</p>
                </div>
              )}

              <Input
                label="저자"
                name="author"
                value={bookData.author}
                onChange={handleChange}
                placeholder="여러분의 저자를 입력해주세요."
              />
            </div>

            {isCreate && (
              <div className="book-step-card-actions">
                <MainButton
                  type="button"
                  onClick={handleBasicNext}
                  disabled={!isBasicInfoComplete}
                  variant="book-flow-next-button"
                >
                  다음으로
                </MainButton>
              </div>
            )}
          </section>
        )}

        {isStepVisible(2) && (
          <section
            ref={contentRef}
            data-book-step="2"
            className={getStepCardClassName(2, "book-flow-story-card")}
          >
            {renderStepHeader(
              2,
              "이야기 입력",
              "표지 생성과 미리보기에 사용할 책 내용 또는 줄거리를 입력합니다.",
            )}

            <div className="book-form-content-field">
              <Input
                label="내용"
                name="content"
                variant="large"
                value={bookData.content}
                onChange={handleChange}
                placeholder="여러분의 책 내용을 입력해주세요."
              />
            </div>

            {isCreate && (
              <div className="book-step-card-actions">
                <MainButton
                  type="button"
                  onClick={handleStoryNext}
                  disabled={!isStoryComplete}
                  variant="book-flow-next-button"
                >
                  다음으로
                </MainButton>
              </div>
            )}
          </section>
        )}

        {isStepVisible(3) && (
          <section
            ref={coverRef}
            data-book-step="3"
            className={getStepCardClassName(3, "book-flow-cover-card")}
          >
            {renderStepHeader(
              3,
              isCreate ? "AI 표지 생성" : "표지",
              isCreate
                ? "책의 분위기에 맞는 표지를 만들거나 표지 없이 이어갈 수 있습니다."
                : "기존 표지를 확인하고 필요하면 다시 생성합니다.",
            )}

            <div className="book-flow-ai-copy">
              <p className="book-flow-ai-question">
                AI가 이 책에 어울리는 표지를 만들어드릴까요?
              </p>
              <p>
                입력한 제목과 내용을 바탕으로 책의 분위기에 맞는 표지를
                생성합니다.
              </p>
            </div>

            <div className="book-flow-cover-panel">
              <ImageForm
                bookData={bookData}
                setBookData={setBookData}
                onGenerated={handleCoverGenerated}
                showTitle={false}
                generateButtonLabel={
                  isCreate ? "AI 표지 만들기" : "AI 표지 다시 만들기"
                }
              />
            </div>

            {isCreate && (
              <div className="book-step-card-actions book-step-card-actions--split">
                <button
                  type="button"
                  className="book-flow-secondary-button"
                  onClick={handleSkipCover}
                >
                  표지 없이 진행하기
                </button>
              </div>
            )}
          </section>
        )}

        {isStepVisible(4) && (
          <section
            ref={previewRef}
            data-book-step="4"
            className={getStepCardClassName(4, "book-flow-preview-card")}
          >
            {renderStepHeader(
              4,
              isCreate ? "최종 미리보기" : "저장 및 관리",
              isCreate
                ? "등록 전 책 정보가 원하는 모습인지 한 번 더 확인합니다."
                : "변경한 내용을 저장하거나 위험 영역에서 도서를 삭제합니다.",
            )}

            <div className="book-flow-preview-layout">
              <div className="book-flow-preview-cover">
                <BookImage
                  key={bookData.coverImageUrl || "default-cover"}
                  src={bookData.coverImageUrl}
                  alt={bookData.title || "도서 표지 미리보기"}
                />
                {!bookData.coverImageUrl && (
                  <span className="book-flow-cover-placeholder-label">
                    기본 표지
                  </span>
                )}
              </div>

              <dl className="book-flow-preview-info">
                <div>
                  <dt>제목</dt>
                  <dd>{bookData.title || "제목 미입력"}</dd>
                </div>
                <div>
                  <dt>저자</dt>
                  <dd>{bookData.author || "저자 미입력"}</dd>
                </div>
                <div>
                  <dt>장르</dt>
                  <dd>{bookData.genre || "장르 미선택"}</dd>
                </div>
                <div className="book-flow-preview-content">
                  <dt>내용 미리보기</dt>
                  <dd>{contentPreview}</dd>
                </div>
              </dl>
            </div>

            <div className="book-form-actions book-flow-final-actions">
              <MainButton
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving
                  ? "저장 중"
                  : isCreate
                    ? "도서 등록하기"
                    : "수정 저장하기"}
              </MainButton>
            </div>

            {!isCreate && (
              <div className="book-flow-danger-zone">
                <div>
                  <strong>위험 영역</strong>
                  <p>삭제한 도서는 되돌릴 수 없습니다.</p>
                </div>
                <MainButton
                  type="button"
                  onClick={onDelete}
                  variant="delete-button"
                  disabled={isSaving}
                >
                  삭제하기
                </MainButton>
              </div>
            )}
          </section>
        )}
        </div>
      </div>
    </div>
  );
}

export default BookForm;
