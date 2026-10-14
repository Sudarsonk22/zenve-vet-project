import { Search, Plus, Menu } from 'lucide-react';
export default function Header({ onCreate, query, setQuery, onMenu }) { return <header className="topbar">
 <button className="mobile-menu" onClick={onMenu} aria-label="Open menu"><Menu size={21}/></button>
 <a className="brand" href="#/" aria-label="Zenve Vet home"><span className="brand-mark">ZV</span><span><b>ZENVE VET<sup>™</sup></b><small>THE PROFESSIONAL NETWORK</small></span></a>
 <label className="top-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search doctors, specialties, cities..."/><span>INDIA</span></label>
 <div className="header-actions"><span className="community"><i/>Open community</span><button className="button button-gold" onClick={onCreate}><Plus size={18}/>Create your profile</button></div>
 </header> }
