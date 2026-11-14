import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { getCharacter } from '../data/characters';
import { CharacterCard } from '../components/ui/CharacterCard';
import { characters } from '../data/characters';
import { asset } from '../lib/assets';
import { usePageTitle } from '../hooks/usePageTitle';
export default function CharacterPage(){
 const {characterId}=useParams();const character=getCharacter(characterId);
 usePageTitle(character?.name || 'Character not found',character?.description);
 if(!character)return <div className="site-container internal-page"><h1 className="page-title">Character not found</h1><Link className="button button-primary mt-7" to="/characters">Meet the cast</Link></div>;
 const others=characters.filter(c=>c.id!==character.id).slice(0,4);
 return <div className="site-container internal-page"><Link to="/characters" className="back-link"><ArrowLeft size={17}/> All Characters</Link><section className="character-detail"><div className="detail-portrait" style={{'--character-color':character.color} as CSSProperties}><img src={asset(character.image)} alt={`${character.name} illustrated portrait`}/></div><div className="detail-copy"><span className="eyebrow">{character.group} · {character.role}</span><h1 className="page-title">{character.name}<span className="detail-dot">.</span></h1><h2>{character.subtitle}</h2><p>{character.description}</p><blockquote>“{character.quote}”</blockquote><div className="info-slab"><strong>PERSONALITY</strong><span>{character.personality}</span></div></div></section><section className="section-space"><div className="section-heading"><div><span className="eyebrow">OFFICIAL CHARACTER ART</span><h2 className="section-title">Character design sheet</h2></div></div><a href={asset(character.sheet)} target="_blank" rel="noopener noreferrer" className="sheet-image-link" aria-label={`View ${character.name} reference artwork in a new tab`}><img src={asset(character.sheet)} alt={`${character.name} turnaround, expressions, and character concept art`} loading="lazy"/></a></section><section className="section-space"><div className="section-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2 className="section-title">Other characters</h2></div><Link to="/characters" className="inline-arrow">All characters <ArrowRight size={17}/></Link></div><div className="cast-rail">{others.map(c=><CharacterCard key={c.id} character={c}/>)}</div></section></div>;
}
