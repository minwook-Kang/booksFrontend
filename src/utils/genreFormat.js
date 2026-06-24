export const getGenreName = (genre) => {
  if (typeof genre === "string") {
    return genre;
  }

  return genre?.name || genre?.genreName || genre?.title || "";
};

export const getGenreId = (genre) => {
  if (!genre || typeof genre === "string") {
    return null;
  }

  return (
    genre.genreId ??
    genre.genre_id ??
    genre.categoryId ??
    genre.category_id ??
    genre.id ??
    null
  );
};
