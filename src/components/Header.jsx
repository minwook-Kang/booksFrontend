import { useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import ThemeToggle from "./ThemeToggle/ThemeToggle";

function getNavVisibility(pathname) {
  if (pathname === "/books") {
    return { showList: false, showCreate: true };
  }

  if (pathname === "/books/new") {
    return { showList: true, showCreate: false };
  }

  if (pathname.endsWith("/edit")) {
    return { showList: true, showCreate: true };
  }

  if (pathname.startsWith("/books/")) {
    return { showList: false, showCreate: true };
  }

  return { showList: true, showCreate: true };
}

function Header({
  isMain = false,
  title = "걷기가 서재",
  onGoList,
  onGoCreate,
  isDarkMode = false,
  onToggleTheme,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { showList, showCreate } = getNavVisibility(pathname);
  const headerClass = isMain ? "header header--main" : "header";

  return (
    <header className={headerClass}>
      <h1 className="header-title">
        <button
          type="button"
          className="header-brand"
          onClick={() => navigate("/")}
          aria-label={`${title} 홈으로 이동`}
        >
          <img className="header-logo" src="/logo.svg" alt="" />
          <span>{title}</span>
        </button>
      </h1>

      <div className="header-content">
        {!isMain && (showList || showCreate) && (
          <nav className="header-nav">
            {showList && (
              <button className="header-button" onClick={onGoList}>
                도서 목록
              </button>
            )}

            {showCreate && (
              <button
                className="header-button header-button-primary"
                onClick={onGoCreate}
              >
                새 도서 등록
              </button>
            )}
          </nav>
        )}
        
        {onToggleTheme && (
          <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
        )}
      </div>
    </header>
  );
}

export default Header;
