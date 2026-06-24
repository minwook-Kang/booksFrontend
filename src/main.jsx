import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom"
import './styles/colors.css'
import './styles/font-size.css'
import "./styles/comSt.css";
import App from './App.jsx'

const normalizeHashRouteUrl = () => {
  const { origin, pathname, search, hash } = window.location;
  const isRootDocument = pathname === "/" || pathname === "/index.html";

  if (isRootDocument) {
    return;
  }

  const routeFromHash = hash.startsWith("#/") ? hash.slice(1) : "";
  const routeFromPath = pathname === "/index.html" ? "/" : pathname;
  const route = routeFromHash || `${routeFromPath}${search}`;

  window.history.replaceState(null, "", `${origin}/#${route}`);
};

normalizeHashRouteUrl();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* App 내부에서 URL 기반 라우팅을 사용할 수 있도록 설정 */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
