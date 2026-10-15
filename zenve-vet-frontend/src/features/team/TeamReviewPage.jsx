import { useEffect, useState } from 'react';
import './teamReview.css';
import logo from '../../assets/zenve-vet-logo.png';

const API = 'http://localhost:8080/api';
const TOKEN_STORAGE = 'zenve-team-token';
const EMAIL_STORAGE = 'zenve-team-email';

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['X-Team-Token'] = token;

  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.fieldErrors?.[0]?.message || data.message || 'Something went wrong');
  }
  return res.json();
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const tabs = [
  { label: 'Pending', status: 'PENDING' },
  { label: 'Approved', status: 'APPROVED' },
  { label: 'Rejected', status: 'REJECTED' },
];

function Header({ email, onSignOut }) {
  return (
    <header className="tr-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img
          src={logo}
          alt="Zenve Vet"
          style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0 }}
        />
        <h1 className="tr-brand" style={{ margin: 0, textAlign: 'left' }}>
          ZENVE VET ·<br />
          TEAM REVIEW
        </h1>
      </div>
      {email && (
        <div className="tr-user">
          <span>{email}</span>
          <button onClick={onSignOut}>Sign out</button>
        </div>
      )}
    </header>
  );
}

function AuthCard({ onDone }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const signup = mode === 'signup';

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await request('POST', signup ? '/team/signup' : '/team/login', form);
      onDone(result);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="tr-card" onSubmit={submit}>
      <h2>{signup ? 'Create team account' : 'Team sign in'}</h2>
      <p>Only for the Zenve Vet review team. Doctors don’t need an account.</p>

      <label htmlFor="tr-email">Email</label>
      <input id="tr-email" name="email" type="email" value={form.email} onChange={change} required />

      <label htmlFor="tr-password">Password</label>
      <input
        id="tr-password"
        name="password"
        type="password"
        value={form.password}
        onChange={change}
        required
      />

      {error && <p className="tr-error">{error}</p>}

      <button type="submit" className="tr-primary" disabled={busy}>
        {signup ? 'Create account' : 'Sign in'}
      </button>

      <button
        type="button"
        className="tr-link"
        onClick={() => {
          setMode(signup ? 'signin' : 'signup');
          setError('');
        }}
      >
        {signup ? 'Have an account? Sign in' : 'Need an account? Create one'}
      </button>
    </form>
  );
}

function Queue({ token, onExpired }) {
  const [status, setStatus] = useState('PENDING');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');

  const load = async current => {
    try {
      const list = await request('GET', '/campaigns?status=' + current, null, token);
      setItems(list);
      setError('');
    } catch (err) {
      if (err.message.includes('session expired')) onExpired();
      else setError(err.message);
    }
  };

  useEffect(() => {
    load(status);
  }, [status]);

  const review = async (id, approved) => {
    try {
      await request('PUT', '/campaigns/' + id + '/review', { approved, note: notes[id] || '' }, token);
      load(status);
    } catch (err) {
      if (err.message.includes('session expired')) onExpired();
      else setError(err.message);
    }
  };

  return (
    <div className="tr-queue">
      <span className="tr-eyebrow">CAMPAIGN REVIEW</span>
      <h2>Review advertising campaigns</h2>

      <div className="tr-tabs">
        {tabs.map(t => (
          <button
            key={t.status}
            className={status === t.status ? 'tr-tab tr-tab-active' : 'tr-tab'}
            onClick={() => setStatus(t.status)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="tr-error">{error}</p>}

      {items.length === 0 && <p className="tr-empty">No {status.toLowerCase()} campaigns.</p>}

      {items.map(c => (
        <article key={c.id} className="tr-item">
          <img src={c.posterUrl} alt={c.headline} />
          <div className="tr-item-body">
            <small>{c.brandName}</small>
            <h3>{c.headline}</h3>
            <p>
              {c.buttonText} → {c.destinationUrl}
            </p>
            <p>
              {formatDate(c.startsAt)} – {c.endsAt ? formatDate(c.endsAt) : 'No end date'}
            </p>

            {status === 'PENDING' && (
              <>
                <textarea
                  placeholder="Note to the advertiser (shown if rejected)"
                  value={notes[c.id] || ''}
                  onChange={e => setNotes({ ...notes, [c.id]: e.target.value })}
                />
                <div className="tr-actions">
                  <button className="tr-primary" onClick={() => review(c.id, true)}>
                    Approve
                  </button>
                  <button className="tr-reject" onClick={() => review(c.id, false)}>
                    Reject
                  </button>
                </div>
              </>
            )}

            {status === 'REJECTED' && c.reviewNote && <p className="tr-error">Reason: {c.reviewNote}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function TeamReviewPage() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE) || '');
  const [email, setEmail] = useState(localStorage.getItem(EMAIL_STORAGE) || '');

  const signedIn = Boolean(token);

  const done = result => {
    localStorage.setItem(TOKEN_STORAGE, result.token);
    localStorage.setItem(EMAIL_STORAGE, result.email);
    setToken(result.token);
    setEmail(result.email);
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_STORAGE);
    localStorage.removeItem(EMAIL_STORAGE);
    setToken('');
    setEmail('');
  };

  return (
    <div className="tr-page">
      <Header email={signedIn ? email : ''} onSignOut={signOut} />
      <main className="tr-main">
        {signedIn ? <Queue token={token} onExpired={signOut} /> : <AuthCard onDone={done} />}
      </main>
    </div>
  );
}