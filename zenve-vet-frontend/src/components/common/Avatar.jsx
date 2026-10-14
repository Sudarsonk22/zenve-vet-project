import './common.css';

// Shows the real profile image; when the backend has none, shows the person's initials.
export default function Avatar({ src, name, size = 40, online }) {
  const initials = (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
  return (
    <span className="zvAvatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {src ? <img src={src} alt={name ? `${name}'s profile` : 'Profile'} loading="lazy" /> : <span aria-hidden="true">{initials}</span>}
      {online !== undefined && (
        <span className={`zvAvatarStatus ${online ? 'isOnline' : ''}`} title={online ? 'Online' : 'Offline'} />
      )}
    </span>
  );
}
