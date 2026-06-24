import { useState } from "react";
import HomeAiCoverSlide from "./HomeAiCoverSlide";
import HomeProfileSlide from "./HomeProfileSlide";
import HomeRecommendedBooksSlide from "./HomeRecommendedBooksSlide";
import HomeSlideControls from "./HomeSlideControls";
import { HOME_SLIDES } from "./homeContent";

const SLIDES = Array.isArray(HOME_SLIDES) ? HOME_SLIDES : [];

function HomeCarousel({
  recommendedBooks,
  isLoadingBooks,
  onGoList,
  onGoRegister,
  onGoDetail,
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  const goPrevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? Math.max(SLIDES.length - 1, 0) : prev - 1,
    );
  };

  const goNextSlide = () => {
    setActiveSlide((prev) =>
      prev === SLIDES.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <section
      className="homePage-carousel"
      aria-roledescription="carousel"
      aria-label="메인 콘텐츠"
    >
      <HomeSlideControls
        activeSlide={activeSlide}
        slides={SLIDES}
        onSelect={setActiveSlide}
      />

      <div className="homePage-carouselStage">
        <button
          type="button"
          className="homePage-carouselButton homePage-carouselButton--prev"
          onClick={goPrevSlide}
          aria-label="이전 슬라이드"
        >
          {"<"}
        </button>

        <div className="homePage-carouselViewport">
          <div
            className="homePage-carouselTrack"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            <HomeProfileSlide isActive={activeSlide === 0} onGoList={onGoList} />
            <HomeRecommendedBooksSlide
              isActive={activeSlide === 1}
              books={recommendedBooks}
              isLoading={isLoadingBooks}
              onGoDetail={onGoDetail}
            />
            <HomeAiCoverSlide
              isActive={activeSlide === 2}
              onGoRegister={onGoRegister}
            />
          </div>
        </div>

        <button
          type="button"
          className="homePage-carouselButton homePage-carouselButton--next"
          onClick={goNextSlide}
          aria-label="다음 슬라이드"
        >
          {">"}
        </button>
      </div>
    </section>
  );
}

export default HomeCarousel;
