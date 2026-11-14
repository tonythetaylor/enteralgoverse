import type { ReactNode } from 'react';
export function SectionHeading({eyebrow,title,children,aside}: {eyebrow?:string; title:string; children?: ReactNode; aside?:ReactNode}) {
 return <div className="section-heading"><div><span className="eyebrow">{eyebrow || 'DISCOVER'}</span><h2 className="section-title">{title}</h2>{children && <p className="section-lede">{children}</p>}</div>{aside && <div className="section-aside">{aside}</div>}</div>;
}
