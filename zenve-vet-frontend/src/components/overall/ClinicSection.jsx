import { useEffect, useState } from 'react';
import { Plus, MapPin, Phone, Clock, Pencil, Trash2 } from 'lucide-react';
import ClinicModal from './ClinicModal';
import { getClinics, createClinic, updateClinic, deleteClinic } from '../clinicApi';
import './clinic.css';

export default function ClinicSection({ vetId, isOwner }) {
  const [clinics, setClinics] = useState([]);
  const [modal, setModal] = useState(null);

  const load = () => getClinics(vetId).then(setClinics).catch(() => setClinics([]));

  useEffect(() => {
    load();
  // `load` is recreated on render; vetId is the intended reload trigger.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vetId]);

  const save = async form => {
    if (modal.id) await updateClinic(modal.id, form);
    else await createClinic(vetId, form);
    setModal(null);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this clinic page?')) return;
    await deleteClinic(id);
    load();
  };

  if (!isOwner && clinics.length === 0) return null;

  return (
    <section className="pf-section">
      <span className="eyebrow">{isOwner ? 'MY CLINICS' : 'CLINICS'}</span>
      <h2>{isOwner ? 'Where I practise.' : 'Where they practise.'}</h2>

      <div className="cs-list">
        {clinics.map(c => (
          <article key={c.id} className="cs-card">
            {c.photoUrl && <img className="cs-photo" src={c.photoUrl} alt={c.name} />}
            <div className="cs-body">
              <h4>{c.name}</h4>
              {c.location && (
                <p>
                  <MapPin size={14} /> {c.location}
                </p>
              )}
              {c.address && <p className="cs-muted">{c.address}</p>}
              {c.phone && (
                <p>
                  <Phone size={14} /> {c.phone}
                </p>
              )}
              {c.openingHours && (
                <p>
                  <Clock size={14} /> {c.openingHours}
                </p>
              )}
              {c.services.length > 0 && (
                <div className="cs-tags">
                  {c.services.map(s => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              )}
              {c.about && <p className="cs-about">{c.about}</p>}
            </div>
            {isOwner && (
              <div className="cs-actions">
                <button onClick={() => setModal(c)} aria-label="Edit clinic">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(c.id)} aria-label="Delete clinic">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </article>
        ))}

        {isOwner && (
          <button className="cs-add" onClick={() => setModal({})}>
            <Plus size={20} /> Add your clinic page
          </button>
        )}
      </div>

      {modal && (
        <ClinicModal
          clinic={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </section>
  );
}

