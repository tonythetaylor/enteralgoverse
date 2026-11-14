import { Disc3, Music2 } from 'lucide-react';
import { asset } from '../lib/assets';
import { usePageTitle } from '../hooks/usePageTitle';
export default function SoundtrackPage(){
 usePageTitle('Soundtrack','The original music and sound behind The Algorithm.');
 return <div className="site-container internal-page"><div className="page-intro"><span className="eyebrow">THE MUSIC OF THE ALGORITHM</span><h1 className="page-title">Every world has <em>a sound.</em></h1><p>The music is part of the storytelling — from late-night Baltimore to the heart of the digital world.</p></div><div className="soundtrack-hero"><img src={asset('assets/brand/the-algorithm-poster.webp')} alt="Poster for The Algorithm"/><div><span className="eyebrow">ORIGINAL SOUNDTRACK</span><h2>ZO × ALGO</h2><p>Official tracks, credits, and streaming links will appear here as they are released.</p><div className="badge badge-dim"><Disc3 size={15}/> TRACKLIST COMING SOON</div></div></div><div className="soundtrack-empty"><Music2 size={33}/><h3>The score is still unfolding.</h3><p>Keep this page as the central home for your episode songs, artist credits, and future soundtrack releases.</p></div></div>;
}
