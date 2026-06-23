'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Car | Omit<Car, 'id'> | null>(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (authenticated) loadCars();
  }, [authenticated, loadCars]);

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
          <h1>Wonderful Car — Admin</h1>
          <p className="muted">CRUD véhicules</p>
        </div>
        <div className="admin-actions">
          <a href="/">← Voir le site</a>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

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

      {editing && (
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
    </div>
  );
}
