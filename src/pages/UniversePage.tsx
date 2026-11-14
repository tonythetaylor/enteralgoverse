import { asset } from '../lib/assets';
import { worlds } from '../data/worlds';
import { WorldCard } from '../components/ui/WorldCard';
import { usePageTitle } from '../hooks/usePageTitle';
export default function UniversePage(){
 usePageTitle('The Algoverse','Explore Baltimore and the digital civilization inside the cloud.');
 return <div className="site-container internal-page"><div className="page-intro"><span className="eyebrow">WORLD BUILDING</span><h1 className="page-title">Welcome to <em>the Algoverse.</em></h1><p>From the Baltimore harbor to the cloud-native cities of the digital world, every environment carries a piece of the story.</p></div><div className="universe-banner"><img src={asset('assets/worlds/algoverse.webp')} alt="The illuminated digital world inside the cloud"/><div><span className="eyebrow">TWO WORLDS COLLIDE</span><h2>The other side of the screen.</h2></div></div><div className="world-grid">{worlds.map(w=><WorldCard world={w} key={w.id}/>)}</div><div className="worldbible-note"><h2>Built one frame at a time.</h2><p>Each district has its own rules, history, and visual language. This world keeps growing with the series.</p><img src={asset('assets/worlds/world-bible.webp')} alt="World bible showing Baltimore and Algoverse environments, district descriptions, and iconography" loading="lazy"/></div></div>;
}
