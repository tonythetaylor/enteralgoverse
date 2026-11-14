import { ArrowRight, ArrowUpRight, Clapperboard, Layers3, Music2, Paintbrush, Play, UsersRound } from 'lucide-react';
import { Link } from 'react-router';
import { SectionHeading } from '../components/ui/SectionHeading';
import { EpisodeCard } from '../components/media/EpisodeCard';
import { CharacterCard } from '../components/ui/CharacterCard';
import { releasedEpisodes } from '../data/episodes';
import { characters } from '../data/characters';
import { asset } from '../lib/assets';
import { site } from '../data/site';
import { usePageTitle } from '../hooks/usePageTitle';

const features=[
 {to:'/characters', label:'CHARACTERS', description:'Meet the humans and bots behind the story.',image:'assets/characters/zo-sheet.webp',Icon:UsersRound},
 {to:'/universe', label:'THE ALGOVERSE', description:'Explore two worlds and everything between.',image:'assets/worlds/algoverse.webp',Icon:Layers3},
 {to:'/soundtrack', label:'SOUNDTRACK', description:'Original sounds from the world of ZO × ALGO.',image:'assets/worlds/legacy-district.webp',Icon:Music2},
 {to:'/about', label:'BEHIND THE ALGORITHM', description:'The making of an independent animated world.',image:'assets/brand/the-algorithm-poster.webp',Icon:Paintbrush},
];
export default function HomePage(){
 usePageTitle('Home',site.intro);
 return <>
  <section className="home-hero"><div className="site-container hero-inner">
   <div className="hero-image"><img src={asset('assets/brand/the-algorithm-poster.webp')} alt="ZO and ALGO looking toward Baltimore harbor at sunset" fetchPriority="high"/><div className="hero-image-overlay"/></div>
   <div className="hero-copy"><span className="eyebrow orange-stroke">A TAYLORTHEORY ORIGINAL ANIMATED SERIES</span><span className="hero-zo">ZO <em>×</em> ALGO</span><h1>THE<br/><span>ALGORITHM</span></h1><p>{site.intro}</p><div className="hero-actions"><Link className="button button-primary" to="/watch/the-resume"><Play size={18} fill="currentColor"/> Watch the Pilot</Link><Link className="button button-secondary" to="/episodes"><Clapperboard size={18}/> Explore Episodes</Link></div><div className="hero-note"><span className="note-line"/> TWO WORLDS. ONE UNEXPECTED CONNECTION.</div></div>
  </div><div className="hero-bottom-shading"/></section>
  <section className="site-container section-space featured-episodes"><SectionHeading eyebrow="NOW SHOWING" title="Start with a connection" aside={<Link to="/episodes" className="inline-arrow">All episodes <ArrowRight size={17}/></Link>}>The pilot and the first chapter of Season One.</SectionHeading><div className="episode-feature-grid">{releasedEpisodes.map(e=><EpisodeCard key={e.id} episode={e}/>)}</div></section>
  <section className="site-container section-space"><SectionHeading eyebrow="FACES OF THE ALGOVERSE" title="Meet the cast" aside={<Link to="/characters" className="inline-arrow">All characters <ArrowRight size={17}/></Link>}>Every story has people worth getting to know — and a few robots.</SectionHeading><div className="cast-rail">{characters.slice(0,6).map(c=><CharacterCard character={c} key={c.id}/>)}</div></section>
  <section className="world-highlight"><div className="site-container world-highlight-inner"><div className="world-highlight-image"><img src={asset('assets/worlds/algoverse.webp')} alt="A glowing digital metropolis above the clouds" loading="lazy"/></div><div className="world-highlight-copy"><span className="eyebrow">WELCOME TO THE OTHER SIDE</span><h2>There’s a whole <em>world</em> behind the screen.</h2><p>Inside the cloud, algorithms have neighborhoods, memories, jobs, friends — and their own ideas about the people they serve.</p><Link to="/universe" className="button button-primary">Explore the Algoverse <ArrowUpRight size={18}/></Link></div></div></section>
  <section className="site-container section-space"><SectionHeading eyebrow="MORE TO EXPLORE" title="Go beyond the episodes"/><div className="feature-grid">{features.map(({to,label,description,image,Icon})=><Link className="feature-card" key={to} to={to}><img src={asset(image)} loading="lazy" alt=""/><div className="feature-card-shade"/><div className="feature-card-copy"><Icon size={21}/><h3>{label}</h3><p>{description}</p></div><ArrowUpRight className="feature-arrow" size={20}/></Link>)}</div></section>
 </>;
}
