import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom"
import './styles/colors.css'
import './styles/font-size.css'
import "./styles/comSt.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* App 내부에서 URL 기반 라우팅을 사용할 수 있도록 설정 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
