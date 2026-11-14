import type { ReactNode } from 'react';
import { NavLink, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Clapperboard, Film, Home, Layers3, Menu, Music2, Search, UsersRound, X } from 'lucide-react';
import { Brand } from '../ui/Brand';
import { episodes } from '../../data/episodes';
import { characters } from '../../data/characters';
import { site } from '../../data/site';
import { asset } from '../../lib/assets';

const nav = [
  {to: '/',label:'Home'}, {to:'/episodes',label:'Episodes'},
  {to:'/characters',label:'Characters'}, {to:'/universe',label:'The Algoverse'},
  {to:'/soundtrack',label:'Soundtrack'}, {to:'/about',label:'Behind the Algorithm'},
];

function SearchOverlay({close}: {close:()=>void}) {
 const [query,setQuery] = useState('');
 useEffect(() => {
  const handle = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
  window.addEventListener('keydown',handle);
  return () => window.removeEventListener('keydown',handle);
 },[close]);
 const q=query.trim().toLowerCase();
 const hits = q ? [
  ...episodes.filter(e=>`${e.title} ${e.description} ${e.numberLabel}`.toLowerCase().includes(q)).map(e=>({label:e.title,category:'Episode',to: e.release === 'released' ? `/watch/${e.id}` : '/episodes',image:e.image})),
  ...characters.filter(c=>`${c.name} ${c.role} ${c.description}`.toLowerCase().includes(q)).map(c=>({label:c.name,category:'Character',to:`/characters/${c.id}`,image:c.image})),
 ] : [];
 return <div className="dialog-scrim" onMouseDown={close} role="presentation"><section role="dialog" aria-modal="true" aria-label="Search the Algoverse" className="search-dialog" onMouseDown={e=>e.stopPropagation()}>
   <div className="flex items-center gap-3"><Search size={20}/><input autoFocus className="search-input" placeholder="Search characters and episodes..." value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search the Algoverse"/><button type="button" className="icon-button" aria-label="Close search" onClick={close}><X size={20}/></button></div>
   {q ? <div className="search-results">{hits.length ? hits.map((hit,i)=><Link key={`${hit.to}-${i}`} to={hit.to} onClick={close} className="search-hit"><img src={asset(hit.image)} alt=""/><span><small>{hit.category}</small><strong>{hit.label}</strong></span><ArrowUpRight size={17}/></Link>) : <p className="muted py-7 text-center">No matches yet. Try another search.</p>}</div> : <p className="muted mt-5 text-sm">Find an episode, character, or part of the story.</p>}
  </section></div>;
}
function Header() {
 const [menuOpen,setMenuOpen] = useState(false);
 const [searchOpen,setSearchOpen] = useState(false);
 useEffect(()=>{document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : '';return ()=>{document.body.style.overflow='';};},[menuOpen,searchOpen]);
 return <>
  <header className="site-header"><div className="site-container header-inner"><Brand />
   <nav className="desktop-nav" aria-label="Main navigation">{nav.map(n=><NavLink key={n.to} to={n.to} end={n.to==='/'} className={({isActive})=>`nav-link ${isActive?'active':''}`}>{n.label}</NavLink>)}</nav>
   <div className="header-actions"><button type="button" aria-label="Search" className="icon-button" onClick={()=>setSearchOpen(true)}><Search size={21}/></button><button type="button" aria-label="Open menu" className="icon-button menu-trigger" onClick={()=>setMenuOpen(true)}><Menu size={24}/></button></div>
  </div></header>
  {menuOpen && <div className="dialog-scrim" onMouseDown={()=>setMenuOpen(false)}><nav className="mobile-drawer" aria-label="Full menu" onMouseDown={e=>e.stopPropagation()}><div className="flex items-center justify-between mb-8"><Brand compact/><button className="icon-button" aria-label="Close menu" onClick={()=>setMenuOpen(false)}><X size={23}/></button></div>{nav.map(n=><NavLink key={n.to} to={n.to} end={n.to==='/'} onClick={()=>setMenuOpen(false)} className="drawer-link">{n.label}<ArrowUpRight size={18}/></NavLink>)}<p className="muted mt-8 text-xs">{site.production}</p></nav></div>}
  {searchOpen && <SearchOverlay close={()=>setSearchOpen(false)}/>}
 </>;
}
function MobileNav() {
 const links = [
  {to:'/',label:'Home', Icon: Home}, {to:'/episodes',label:'Episodes',Icon:Film},
  {to:'/characters',label:'Characters',Icon:UsersRound}, {to:'/universe',label:'Universe',Icon:Layers3},
  {to:'/soundtrack',label:'More',Icon:Menu},
 ];
 return <nav className="mobile-bottom-nav" aria-label="Quick navigation"><div className="mobile-bottom-inner">{links.map(({to,label,Icon})=><NavLink end={to==='/'} to={to} key={to} className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`}><Icon size={21} strokeWidth={1.8}/><span>{label}</span></NavLink>)}</div></nav>;
}
function Footer() {
 return <footer className="site-footer"><div className="site-container footer-layout"><div><Brand compact/><p className="muted mt-3 text-sm max-w-xs">Every connection has a story.</p><p className="tiny-note mt-5">© {new Date().getFullYear()} TaylorTheory Multimedia & Design. Original character art and stories. All rights reserved.</p></div><div className="footer-nav"><Link to="/episodes"><Clapperboard size={17}/> Watch</Link><Link to="/characters"><UsersRound size={17}/> Characters</Link><Link to="/universe"><Layers3 size={17}/> Explore</Link><Link to="/soundtrack"><Music2 size={17}/> Soundtrack</Link></div><p className="production-credit">{site.production.toUpperCase()}</p></div></footer>;
}
export function SiteLayout({children}:{children:ReactNode}) {
 return <div className="app-shell"><button type="button" onClick={()=>document.getElementById('main')?.focus()} className="skip-link">Skip to content</button><Header/><main id="main" tabIndex={-1} className="page-content">{children}</main><Footer/><MobileNav/></div>;
}
