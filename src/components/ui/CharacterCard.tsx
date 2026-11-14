import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Character } from '../../types/content';
import { asset } from '../../lib/assets';
export function CharacterCard({character}:{character:Character}) {
 return <Link to={`/characters/${character.id}`} className="character-card" style={{'--character-color':character.color} as CSSProperties}>
  <div className="character-visual"><img src={asset(character.image)} alt={`${character.name} character artwork`} loading="lazy" /></div>
  <div className="character-meta"><div><span className="card-eyebrow">{character.group}</span><h3>{character.name}</h3><p>{character.subtitle}</p></div><ArrowUpRight size={22}/></div>
 </Link>;
}
