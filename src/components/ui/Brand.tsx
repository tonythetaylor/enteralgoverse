import { Link } from 'react-router';
export function Brand({compact = false}: {compact?: boolean}) {
  return <Link to="/" className="brand-logo" aria-label="EnterAlgoverse, home">
    <span className="brand-enter">ENTER</span>
    <span className="brand-algo">ALGO<span>VERSE</span><small>.COM</small></span>
    {!compact && <span className="brand-underline" aria-hidden="true" />}
  </Link>;
}
