import { Route, Routes, useLocation } from 'react-router';
import { useEffect } from 'react';
import { SiteLayout } from '../components/layout/SiteLayout';
import HomePage from '../pages/HomePage';
import EpisodesPage from '../pages/EpisodesPage';
import WatchPage from '../pages/WatchPage';
import CharactersPage from '../pages/CharactersPage';
import CharacterPage from '../pages/CharacterPage';
import UniversePage from '../pages/UniversePage';
import SoundtrackPage from '../pages/SoundtrackPage';
import AboutPage from '../pages/AboutPage';
import NotFoundPage from '../pages/NotFoundPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({top: 0, behavior: 'instant'}); }, [pathname]);
  return null;
}
export default function App() {
  return <>
    <ScrollToTop />
    <SiteLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/episodes" element={<EpisodesPage />} />
        <Route path="/watch/:episodeId" element={<WatchPage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/characters/:characterId" element={<CharacterPage />} />
        <Route path="/universe" element={<UniversePage />} />
        <Route path="/soundtrack" element={<SoundtrackPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SiteLayout>
  </>;
}
