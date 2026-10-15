import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Download,
  Eye,
  KeyRound,
  LogOut,
  Megaphone,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import NewCampaignModal from './NewCampaignModal';
import './advertise.css';

const API = 'http://localhost:8080/api';
const KEY_STORAGE = 'zenve-advertiser-key';

async function request(method, path, body, key) {
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['X-Advertiser-Key'] = key;

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
  return res.status === 204 ? null : res.json();
}

const features = [
  {
    icon: Users,
    title: 'Doctors & clinics',
    text: 'Small-animal, livestock, equine and research professionals across India.',
  },
  {
    icon: ShieldCheck,
    title: 'Reviewed before going live',
    text: 'Every campaign is checked by the Zenve Vet team, keeping the feed trustworthy.',
  },
  {
    icon: Eye,
    title: 'Transparent reports',
    text: 'Views, clicks and click-through rate by day and by campaign.',
  },
];

const statusLabel = { PENDING: 'In review', APPROVED: 'Approved', REJECTED: 'Rejected' };

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function downloadKey(brandName, accessKey) {
  const text =
    'Zenve Vet advertiser access key\n' +
    'Brand: ' + brandName + '\n\n' +
    accessKey + '\n\n' +
    'Keep this file safe. It is the only way to open your dashboard on another device.\n';
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'zenve-advertiser-access-key.txt';
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdvertisePage() {
  const [view, setView] = useState('landing');
  const [advertiser, setAdvertiser] = useState(null);
  const [accessKey, setAccessKey] = useState('');
  const [form, setForm] = useState({ brandName: '', email: '', website: '' });
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState({ campaigns: 0, live: 0, views: 0, clicks: 0 });
  const [modal, setModal] = useState(false);

  const loadDashboard = async key => {
    const [list, stats] = await Promise.all([
      request('GET', '/advertisers/me/campaigns', null, key),
      request('GET', '/advertisers/me/summary', null, key),
    ]);
    setCampaigns(list);
    setSummary(stats);
  };

  useEffect(() => {
    const saved = localStorage.getItem(KEY_STORAGE);
    if (!saved) return;
    request('POST', '/advertisers/access', { accessKey: saved })
      .then(async found => {
        setAdvertiser(found);
        setAccessKey(saved);
        await loadDashboard(saved);
        setView('dashboard');
      })
      .catch(() => localStorage.removeItem(KEY_STORAGE));
  }, []);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const start = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const created = await request('POST', '/advertisers', form);
      localStorage.setItem(KEY_STORAGE, created.accessKey);
      setAdvertiser(created);
      setAccessKey(created.accessKey);
      setForm({ brandName: '', email: '', website: '' });
      setView('ready');
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const openWithKey = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const key = keyInput.trim();
      const found = await request('POST', '/advertisers/access', { accessKey: key });
      localStorage.setItem(KEY_STORAGE, key);
      setAdvertiser(found);
      setAccessKey(key);
      setKeyInput('');
      await loadDashboard(key);
      setView('dashboard');
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const openDashboard = async () => {
    setError('');
    try {
      await loadDashboard(accessKey);
      setView('dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const signOut = () => {
    localStorage.removeItem(KEY_STORAGE);
    setAdvertiser(null);
    setAccessKey('');
    setCampaigns([]);
    setView('landing');
  };

  const submitCampaign = async data => {
    await request('POST', '/advertisers/me/campaigns', data, accessKey);
    await loadDashboard(accessKey);
    setModal(false);
  };

  const removeCampaign = async id => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await request('DELETE', '/advertisers/me/campaigns/' + id, null, accessKey);
      await loadDashboard(accessKey);
    } catch (err) {
      setError(err.message);
    }
  };

  if (view === 'dashboard' && advertiser) {
    return (
      <main className="main-content ad-main">
        <header className="ad-dash-head">
          <div>
            <span className="ad-dash-eyebrow">ADVERTISER DASHBOARD</span>
            <h1>{advertiser.brandName}</h1>
            <p>{advertiser.email}</p>
          </div>
          <div className="ad-dash-actions">
            <button className="ad-outline" onClick={() => downloadKey(advertiser.brandName, accessKey)}>
              <Download size={15} /> Access key
            </button>
            <button className="ad-text" onClick={signOut}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </header>

        <div className="ad-tabs">
          <div className="ad-tab-buttons">
            <button
              className={tab === 'campaigns' ? 'ad-tab ad-tab-active' : 'ad-tab'}
              onClick={() => setTab('campaigns')}
            >
              <Megaphone size={15} /> Campaigns
            </button>
            <button
              className={tab === 'reports' ? 'ad-tab ad-tab-active' : 'ad-tab'}
              onClick={() => setTab('reports')}
            >
              Reports
            </button>
          </div>
          <button className="ad-cream ad-new" onClick={() => setModal(true)}>
            <Plus size={16} /> New campaign
          </button>
        </div>

        <div className="ad-stats">
          <div>
            <small>CAMPAIGNS</small>
            <b>{summary.campaigns}</b>
          </div>
          <div>
            <small>LIVE</small>
            <b>{summary.live}</b>
          </div>
          <div>
            <small>ALL-TIME VIEWS</small>
            <b>{summary.views}</b>
          </div>
          <div>
            <small>ALL-TIME CLICKS</small>
            <b>{summary.clicks}</b>
          </div>
        </div>

        {error && <p className="ad-error">{error}</p>}

        <div className="ad-divider" />

        {tab === 'campaigns' && campaigns.length === 0 && (
          <div className="ad-empty">
            <Megaphone size={26} />
            <h2>Create your first campaign</h2>
            <p>
              Upload a poster, add your link and pick your dates. Our team reviews it before it
              goes live.
            </p>
          </div>
        )}

        {tab === 'campaigns' && campaigns.length > 0 && (
          <div className="ad-campaigns">
            {campaigns.map(c => (
              <article key={c.id} className="ad-campaign">
                <img src={c.posterUrl} alt={c.headline} />
                <div className="ad-campaign-body">
                  <div className="ad-campaign-top">
                    <h3>{c.headline}</h3>
                    <span className={'ad-badge ad-badge-' + c.status.toLowerCase()}>
                      {statusLabel[c.status]}
                    </span>
                  </div>
                  <p className="ad-muted">
                    {formatDate(c.startsAt)} – {c.endsAt ? formatDate(c.endsAt) : 'No end date'}
                  </p>
                  <p className="ad-muted">{c.destinationUrl}</p>
                  {c.status === 'REJECTED' && c.reviewNote && (
                    <p className="ad-note">Reason: {c.reviewNote}</p>
                  )}
                  <div className="ad-campaign-foot">
                    <span>{c.views} views</span>
                    <span>{c.clicks} clicks</span>
                    <button className="ad-text ad-danger" onClick={() => removeCampaign(c.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'reports' && (
          <div className="ad-empty">
            <Eye size={26} />
            <h2>Reports</h2>
            <p>Daily views, clicks and click-through rate will appear here once your campaigns are live.</p>
          </div>
        )}

        {modal && <NewCampaignModal onClose={() => setModal(false)} onSubmit={submitCampaign} />}
      </main>
    );
  }

  return (
    <main className="main-content ad-main">
      <section className="ad-hero">
        <span className="ad-eyebrow">ADVERTISE ON ZENVE VET</span>
        <h1>Reach India’s veterinary professionals where they share their work.</h1>
        <p>
          Your poster appears as a sponsored post inside the doctors’ feed — clearly labelled,
          reviewed by our team, measured with daily views and clicks.
        </p>

        <div className="ad-features">
          {features.map(f => (
            <div key={f.title} className="ad-feature">
              <f.icon size={20} />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>

        <p className="ad-pricing">
          Pricing on request — write to{' '}
          <a href="mailto:zenvefashions@gmail.com">zenvefashions@gmail.com</a>.
        </p>
      </section>

      {view === 'ready' && advertiser && (
        <section className="ad-card ad-ready">
          <KeyRound size={22} />
          <h2>Your advertiser account is ready</h2>
          <p>
            There’s no password. Access is kept in this browser. Download your access key now to
            sign in on another device — it is shown only once.
          </p>
          <button className="ad-outline" onClick={() => downloadKey(advertiser.brandName, accessKey)}>
            <Download size={15} /> Download access key
          </button>
          <button className="ad-cream" onClick={openDashboard}>
            Open my dashboard <ArrowUpRight size={14} />
          </button>
          {error && <p className="ad-error">{error}</p>}
        </section>
      )}

      {view === 'landing' && (
        <section className="ad-grid">
          <form className="ad-card" onSubmit={start}>
            <h2>Create an advertiser account</h2>

            <label htmlFor="ad-brand">Brand name</label>
            <input
              id="ad-brand"
              name="brandName"
              value={form.brandName}
              onChange={change}
              placeholder="Your brand"
              required
            />

            <label htmlFor="ad-email">Contact email</label>
            <input
              id="ad-email"
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              placeholder="you@brand.com"
              required
            />

            <label htmlFor="ad-site">Website</label>
            <input
              id="ad-site"
              name="website"
              value={form.website}
              onChange={change}
              placeholder="brand.com"
            />

            <button type="submit" className="ad-cream" disabled={busy}>
              Start advertising <ArrowUpRight size={14} />
            </button>
            <p className="ad-small">No login needed. Free to set up.</p>
          </form>

          <form className="ad-card" onSubmit={openWithKey}>
            <h2>Already advertising?</h2>

            <label htmlFor="ad-key">Paste your access key</label>
            <input
              id="ad-key"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="ZENVE-ADV:..."
              required
            />

            <button type="submit" className="ad-outline" disabled={busy}>
              <KeyRound size={15} /> Open dashboard
            </button>
          </form>

          {error && <p className="ad-error ad-error-wide">{error}</p>}
        </section>
      )}
    </main>
  );
}