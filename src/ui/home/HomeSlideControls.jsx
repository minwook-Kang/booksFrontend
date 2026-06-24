function HomeSlideControls({ activeSlide, slides, onSelect }) {
  const safeSlides = Array.isArray(slides) ? slides : [];

  return (
    <div className="homePage-tabs" aria-label="슬라이드 선택">
      {safeSlides.map((slide, index) => (
        <button
          key={slide.id ?? index}
          type="button"
          className={`homePage-tab${
            activeSlide === index ? " homePage-tab--active" : ""
          }`}
          onClick={() => onSelect(index)}
          aria-label={`${slide.label ?? index + 1} 슬라이드로 이동`}
          aria-pressed={activeSlide === index}
        >
          <span>{slide.label ?? `Slide ${index + 1}`}</span>
        </button>
      ))}
    </div>
  );
}

export default HomeSlideControls;
