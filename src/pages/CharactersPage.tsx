import { useState } from 'react';
import { CharacterCard } from '../components/ui/CharacterCard';
import { characters } from '../data/characters';
import { usePageTitle } from '../hooks/usePageTitle';
export default function CharactersPage(){
 const [filter,setFilter]=useState('All');
 usePageTitle('Characters','Meet ZO, ALGO, NIA, JAY, MOM, NOVA, and CACHE.');
 const visible=characters.filter(c=>filter==='All'||c.group===filter);
 return <div className="site-container internal-page"><div className="page-intro"><span className="eyebrow">MEET THE CAST</span><h1 className="page-title">Two worlds. <em>One story.</em></h1><p>People, personalities, and little pieces of code with more heart than you might expect.</p></div><div className="filter-row" role="group" aria-label="Filter characters">{['All','Human world','Digital world'].map(f=><button key={f} aria-pressed={filter===f} className={`filter-button ${filter===f?'selected':''}`} onClick={()=>setFilter(f)}>{f}</button>)}</div><div className="characters-grid">{visible.map(c=><CharacterCard key={c.id} character={c}/>)}</div></div>;
}
