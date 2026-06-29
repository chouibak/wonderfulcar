'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type SiteSettingsInput } from '@/lib/settings';

type Car = {
  id: number;
  name: string;
  category: string;
  price: number;
  transmission: string;
  seats: number;
  fuel: string;
  bags: number;
  image: string;
  badge: string;
  active: boolean;
};

const EMPTY: Omit<Car, 'id'> = {
  name: '',
  category: 'economique',
  price: 200,
  transmission: 'manuelle',
  seats: 5,
  fuel: 'Essence',
  bags: 2,
  image: '/assets/cars/dacia-sandero.jpg',
  badge: 'Disponible',
  active: true,
};

type AdminTab = 'fleet' | 'settings';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<AdminTab>('fleet');
  const [cars, setCars] = useState<Car[]>([]);
  const [settings, setSettings] = useState<SiteSettingsInput>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Car | Omit<Car, 'id'> | null>(null);
  const [saving, setSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const checkSession = useCallback(async () => {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    setAuthenticated(Boolean(data.authenticated));
  }, []);

  const loadCars = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cars?admin=1');
      if (!res.ok) throw new Error('Impossible de charger la flotte');
      setCars(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Impossible de charger les paramètres');
      setSettings(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (authenticated) {
      loadCars();
      loadSettings();
    }
  }, [authenticated, loadCars, loadSettings]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError('Mot de passe incorrect');
      return;
    }
    setPassword('');
    setAuthenticated(true);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    setCars([]);
  }

  function startCreate() {
    setEditing({ ...EMPTY });
  }

  function startEdit(car: Car) {
    setEditing({ ...car });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');

    const isNew = !('id' in editing);
    const url = isNew ? '/api/cars' : `/api/cars/${editing.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });

    setSaving(false);
    if (!res.ok) {
      setError('Échec de l’enregistrement');
      return;
    }
    setEditing(null);
    loadCars();
  }

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSaved(false);
    setError('');

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    setSettingsSaving(false);
    if (!res.ok) {
      setError('Échec de l’enregistrement des paramètres');
      return;
    }
    setSettings(await res.json());
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce véhicule ?')) return;
    const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Échec de la suppression');
      return;
    }
    loadCars();
  }

  if (authenticated === null) {
    return (
      <div className="admin-wrap">
        <p className="muted">Chargement…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-login admin-card">
        <h1>Wonderful Car — Admin</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>
          Gestion de la flotte
        </p>
        <form onSubmit={handleLogin}>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          {loginError && <p className="error">{loginError}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Connexion
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div>
          <h1>Administration</h1>
          <p className="muted">Flotte & paramètres du site</p>
        </div>
        <div className="admin-actions">
          <a href="/">← Voir le site</a>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === 'fleet' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('fleet')}
        >
          Flotte
        </button>
        <button
          type="button"
          className={tab === 'settings' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('settings')}
        >
          Paramètres du site
        </button>
      </div>

      {tab === 'fleet' && (
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-actions">
          <button type="button" className="btn-primary" onClick={startCreate}>
            + Ajouter un véhicule
          </button>
          <button type="button" className="btn-ghost" onClick={loadCars}>
            Actualiser
          </button>
        </div>

        {loading ? (
          <p className="muted">Chargement…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id}>
                  <td data-label="Photo">
                    <img src={car.image} alt="" className="car-thumb" />
                  </td>
                  <td data-label="Nom">{car.name}</td>
                  <td data-label="Catégorie">{car.category}</td>
                  <td data-label="Prix">{car.price} DH</td>
                  <td data-label="Statut">
                    {car.active ? (
                      <span className="muted">Actif</span>
                    ) : (
                      <span className="badge-inactive">Masqué</span>
                    )}
                  </td>
                  <td data-label="Actions">
                    <div className="admin-actions">
                      <button type="button" className="btn-ghost btn-sm" onClick={() => startEdit(car)}>
                        Modifier
                      </button>
                      <button type="button" className="btn-danger btn-sm" onClick={() => handleDelete(car.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      {tab === 'fleet' && editing && (
        <div className="admin-card">
          <h2 style={{ marginTop: 0 }}>{'id' in editing ? 'Modifier' : 'Nouveau véhicule'}</h2>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div>
                <label>Nom</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Catégorie</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                >
                  <option value="economique">Économique</option>
                  <option value="compacte">Compacte</option>
                  <option value="suv">SUV</option>
                  <option value="4x4">4x4</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
              <div>
                <label>Prix (DH/jour)</label>
                <input
                  type="number"
                  min={0}
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label>Transmission</label>
                <select
                  value={editing.transmission}
                  onChange={(e) => setEditing({ ...editing, transmission: e.target.value })}
                >
                  <option value="manuelle">Manuelle</option>
                  <option value="automatique">Automatique</option>
                </select>
              </div>
              <div>
                <label>Places</label>
                <input
                  type="number"
                  min={1}
                  value={editing.seats}
                  onChange={(e) => setEditing({ ...editing, seats: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label>Carburant</label>
                <input
                  value={editing.fuel}
                  onChange={(e) => setEditing({ ...editing, fuel: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Bagages</label>
                <input
                  type="number"
                  min={0}
                  value={editing.bags}
                  onChange={(e) => setEditing({ ...editing, bags: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label>Badge</label>
                <input
                  value={editing.badge}
                  onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                />
              </div>
              <div className="full">
                <label>Image (URL ou chemin)</label>
                <input
                  value={editing.image}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  placeholder="/assets/cars/dacia-sandero.jpg"
                  required
                />
              </div>
            </div>
            <div className="checkbox-row">
              <input
                id="active"
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              />
              <label htmlFor="active" style={{ margin: 0 }}>
                Visible sur le site
              </label>
            </div>
            <div className="admin-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'settings' && (
        <div className="admin-card">
          <div className="admin-actions">
            <h2 style={{ margin: 0, flex: 1 }}>Identité & contact</h2>
            <button type="button" className="btn-ghost" onClick={loadSettings}>
              Actualiser
            </button>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            Configurez le logo, le nom de marque et les coordonnées affichés sur le site public.
          </p>

          {settingsLoading ? (
            <p className="muted">Chargement…</p>
          ) : (
            <form onSubmit={handleSaveSettings}>
              <h3 className="settings-section-title">Marque & logo</h3>
              <div className="form-grid">
                <div>
                  <label>Nom de marque</label>
                  <input
                    value={settings.brandName}
                    onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                    placeholder="Wonderful"
                    required
                  />
                </div>
                <div>
                  <label>Accent (partie colorée)</label>
                  <input
                    value={settings.brandAccent}
                    onChange={(e) => setSettings({ ...settings, brandAccent: e.target.value })}
                    placeholder="Car"
                  />
                </div>
                <div>
                  <label>Icône logo (initiales)</label>
                  <input
                    value={settings.logoIcon}
                    onChange={(e) => setSettings({ ...settings, logoIcon: e.target.value })}
                    placeholder="WC"
                    maxLength={4}
                  />
                </div>
                <div className="full">
                  <label>Logo image (URL ou chemin, optionnel)</label>
                  <input
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    placeholder="/assets/logo.png ou https://..."
                  />
                </div>
              </div>

              {settings.logoUrl ? (
                <div className="logo-preview">
                  <img src={settings.logoUrl} alt="Aperçu logo" />
                </div>
              ) : (
                <div className="logo-preview logo-preview-text">
                  <span className="logo-preview-icon">{settings.logoIcon || '?'}</span>
                  <span>
                    {settings.brandName}
                    {settings.brandAccent ? (
                      <em style={{ color: '#f59e0b', fontStyle: 'normal' }}> {settings.brandAccent}</em>
                    ) : null}
                  </span>
                </div>
              )}

              <h3 className="settings-section-title">Contact</h3>
              <div className="form-grid">
                <div>
                  <label>Téléphone (affichage)</label>
                  <input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="+212 6XX XXX XXX"
                    required
                  />
                </div>
                <div>
                  <label>WhatsApp (chiffres uniquement)</label>
                  <input
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value.replace(/\D/g, '') })}
                    placeholder="2126XXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Ville</label>
                  <input
                    value={settings.city}
                    onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                    placeholder="Fès"
                  />
                </div>
                <div className="full">
                  <label>Adresse</label>
                  <textarea
                    className="admin-textarea"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="full">
                  <label>URL Google Maps</label>
                  <input
                    value={settings.mapUrl}
                    onChange={(e) => setSettings({ ...settings, mapUrl: e.target.value })}
                    placeholder="https://www.google.com/maps/place/..."
                    required
                  />
                </div>
                <div className="full">
                  <label>Horaires</label>
                  <input
                    value={settings.openingHours}
                    onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                    placeholder="Ouvert 24h/24, 7j/7"
                  />
                </div>
              </div>

              <h3 className="settings-section-title">Contenu & SEO</h3>
              <div className="form-grid">
                <div className="full">
                  <label>Titre de la page</label>
                  <input
                    value={settings.metaTitle}
                    onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="full">
                  <label>Meta description</label>
                  <textarea
                    className="admin-textarea"
                    value={settings.metaDescription}
                    onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="full">
                  <label>Badge hero</label>
                  <input
                    value={settings.heroBadge}
                    onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                  />
                </div>
                <div className="full">
                  <label>Description hero</label>
                  <textarea
                    className="admin-textarea"
                    value={settings.heroDescription}
                    onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="full">
                  <label>Titre section contact</label>
                  <input
                    value={settings.contactTitle}
                    onChange={(e) => setSettings({ ...settings, contactTitle: e.target.value })}
                  />
                </div>
                <div className="full">
                  <label>Texte footer</label>
                  <textarea
                    className="admin-textarea"
                    value={settings.footerTagline}
                    onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="full">
                  <label>Vidéo hero (URL ou chemin)</label>
                  <input
                    value={settings.heroVideoUrl}
                    onChange={(e) => setSettings({ ...settings, heroVideoUrl: e.target.value })}
                    placeholder="7727416-hd_1280_720_50fps.mp4"
                  />
                </div>
              </div>

              <div className="admin-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={settingsSaving}>
                  {settingsSaving ? 'Enregistrement…' : 'Enregistrer les paramètres'}
                </button>
                {settingsSaved && <span className="success-msg">Paramètres enregistrés</span>}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
