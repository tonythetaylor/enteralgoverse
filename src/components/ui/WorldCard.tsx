import { asset } from '../../lib/assets';
import type { World } from '../../types/content';
export function WorldCard({world}:{world:World}){
 return <article className="world-card"><div className="world-visual"><img src={asset(world.image)} alt={`Concept art of ${world.title}`} loading="lazy"/></div><div className="world-copy"><span className="card-eyebrow">{world.eyebrow}</span><h3>{world.title}</h3><p>{world.description}</p></div></article>;
}
