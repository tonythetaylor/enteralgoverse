import { EpisodeCard } from '../components/media/EpisodeCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { episodes } from '../data/episodes';
import { usePageTitle } from '../hooks/usePageTitle';
export default function EpisodesPage(){
 usePageTitle('Episodes','Watch The Algorithm pilot and Season One, with new stories coming soon.');
 return <div className="site-container internal-page"><div className="page-intro"><span className="eyebrow">THE ALGORITHM</span><h1 className="page-title">Stories in <em>motion.</em></h1><p>Start with the pilot, continue with Reconnected, and follow what comes next.</p></div><SectionHeading eyebrow="AVAILABLE EPISODES" title="Watch now"/><div className="episode-feature-grid">{episodes.filter(e=>e.release==='released').map(e=><EpisodeCard episode={e} key={e.id}/>)}</div><div className="mt-17"><SectionHeading eyebrow="SEASON ONE" title="Coming soon">The rest of the season is taking shape. Episode titles and release dates will appear here when announced.</SectionHeading><div className="episodes-upcoming-grid">{episodes.filter(e=>e.release==='coming-soon').map(e=><EpisodeCard episode={e} key={e.id}/>)}</div></div></div>;
}
