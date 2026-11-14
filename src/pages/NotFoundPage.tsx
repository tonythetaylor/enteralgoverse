import { Link } from 'react-router';
export default function NotFoundPage(){return <div className="site-container not-found"><span className="eyebrow">404 · SIGNAL LOST</span><h1>Looks like this route got filtered.</h1><p>Even ALGO can't find every connection.</p><Link to="/" className="button button-primary mt-7">Return to the Algoverse</Link></div>;}
