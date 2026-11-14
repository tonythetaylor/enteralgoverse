import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router';
import App from './app/App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter><App /></HashRouter>
  </StrictMode>,
);
