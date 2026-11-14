import { ArrowUpRight, LockKeyhole, Play } from 'lucide-react';
import { Link } from 'react-router';
import type { Episode } from '../../types/content';
import { asset } from '../../lib/assets';

export function EpisodeCard({episode, layout='poster'}: {episode:Episode;layout?:'poster'|'horizontal'}) {
 const soon=episode.release === 'coming-soon';
 return <article className={`episode-card ${layout==='horizontal'?'episode-card-horizontal':''} ${soon?'is-coming':''}`}>
  <Link to={soon?'/episodes':`/watch/${episode.id}`} className="episode-image-wrap" aria-label={soon?`${episode.numberLabel}, coming soon`:`Watch ${episode.title}`}>
    <img src={asset(episode.image)} alt="" loading="lazy"/>
    <span className="episode-play" aria-hidden="true">{soon?<LockKeyhole size={21}/>:<Play fill="currentColor" size={19}/>}</span>
    <span className="episode-image-status">{soon?'COMING SOON':episode.numberLabel}</span>
  </Link>
  <div className="episode-content"><span className="card-eyebrow">{episode.numberLabel}</span><h3><Link to={soon?'/episodes':`/watch/${episode.id}`}>{episode.title}</Link></h3><p>{episode.description}</p>{!soon && <Link to={`/watch/${episode.id}`} className="text-link">Watch episode <ArrowUpRight size={16}/></Link>}</div>
 </article>;
}
