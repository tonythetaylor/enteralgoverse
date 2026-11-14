import { ArrowLeft, ArrowRight, Film } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { VideoPlayer } from '../components/media/VideoPlayer';
import { EpisodeCard } from '../components/media/EpisodeCard';
import { episodes, getEpisode } from '../data/episodes';
import { usePageTitle } from '../hooks/usePageTitle';
export default function WatchPage(){
 const {episodeId}=useParams();const episode=getEpisode(episodeId);
 usePageTitle(episode?.title || 'Episode unavailable',episode?.description);
 if(!episode)return <div className="site-container internal-page"><h1 className="page-title">Episode not found.</h1><Link to="/episodes" className="button button-primary mt-8">Browse episodes</Link></div>;
 const next=episodes.find(e=>e.index===episode.index+1 && e.release==='released');
 return <div className="site-container watch-page"><Link className="back-link" to="/episodes"><ArrowLeft size={17}/> All Episodes</Link><div className="watch-heading"><div><span className="eyebrow">{episode.numberLabel} · THE ALGORITHM</span><h1 className="page-title">{episode.title}</h1></div><span className="watch-tag"><Film size={16}/> Original Series</span></div><VideoPlayer key={episode.id} episode={episode}/><div className="watch-below"><div><h2>About this episode</h2><p>{episode.fullDescription}</p><p className="muted small-caps mt-6">{episode.credits?.join(' · ')}</p><p className="muted mt-4 text-sm">Stream in your browser or use the Cast / AirPlay controls when supported. Availability depends on your browser and device.</p></div><aside className="next-episode"><span className="eyebrow">KEEP WATCHING</span>{next?<Link to={`/watch/${next.id}`} className="next-link">Up next: {next.title} <ArrowRight size={18}/></Link>:<><h3>More episodes are on the way.</h3><Link className="inline-arrow" to="/episodes">View the season <ArrowRight size={18}/></Link></>}</aside></div><div className="mt-18"><h2 className="section-title">More from the series</h2><div className="episode-feature-grid mt-7">{episodes.filter(e=>e.release==='released'&&e.id!==episode.id).map(e=><EpisodeCard episode={e} key={e.id}/>)}</div></div></div>;
}
