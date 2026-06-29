export type SiteSettingsInput = {
  brandName: string;
  brandAccent: string;
  logoIcon: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  mapUrl: string;
  metaTitle: string;
  metaDescription: string;
  heroBadge: string;
  heroDescription: string;
  openingHours: string;
  heroVideoUrl: string;
  footerTagline: string;
  contactTitle: string;
};

export const DEFAULT_SETTINGS: SiteSettingsInput = {
  brandName: 'Wonderful',
  brandAccent: 'Car',
  logoIcon: 'WC',
  logoUrl: '',
  phone: '+212 625 699 723',
  whatsapp: '212625699723',
  email: 'contact@wonderfulcar.ma',
  address: "Route de l'Aéroport, Fès 30000\nMaroc",
  city: 'Fès',
  mapUrl:
    'https://www.google.com/maps/place/Wonderful+car/@34.0118964,-4.9883199,17z/data=!3m6!1s0xd9f8b820ef15e9b:0x42def445d4b05c24!8m2!3d34.0118964!4d-4.9883199',
  metaTitle: 'Wonderful Car | Location de Voitures à Fès',
  metaDescription:
    'Wonderful Car — Location de voitures à Fès, Maroc. Véhicules récents, assurance tous risques, livraison aéroport 24/7. À partir de 199 DH/jour.',
  heroBadge: 'Disponible 24h/24 — Fès, Maroc',
  heroDescription:
    "Wonderful Car vous propose des véhicules récents avec assurance tous risques. Livraison gratuite à l'aéroport Fès-Saïss et dans toute la ville.",
  openingHours: 'Ouvert 24h/24, 7j/7',
  heroVideoUrl: '7727416-hd_1280_720_50fps.mp4',
  footerTagline: 'Location de voitures premium à Fès, Maroc. Véhicules récents, service 24/7.',
  contactTitle: 'Retrouvez-nous à Fès',
};

export function fullBrandName(settings: Pick<SiteSettingsInput, 'brandName' | 'brandAccent'>) {
  return settings.brandAccent
    ? `${settings.brandName} ${settings.brandAccent}`.trim()
    : settings.brandName.trim();
}

export function serializeSettings(row: SiteSettingsInput) {
  return { ...row };
}

export function parseSettingsBody(body: unknown): SiteSettingsInput | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  const brandName = String(b.brandName || '').trim();
  const phone = String(b.phone || '').trim();
  const whatsapp = String(b.whatsapp || '').replace(/\D/g, '');
  const email = String(b.email || '').trim();
  const address = String(b.address || '').trim();
  const mapUrl = String(b.mapUrl || '').trim();
  const metaTitle = String(b.metaTitle || '').trim();

  if (!brandName || !phone || !whatsapp || !email || !address || !mapUrl || !metaTitle) {
    return null;
  }

  return {
    brandName,
    brandAccent: String(b.brandAccent || '').trim(),
    logoIcon: String(b.logoIcon || '').trim(),
    logoUrl: String(b.logoUrl || '').trim(),
    phone,
    whatsapp,
    email,
    address,
    city: String(b.city || '').trim(),
    mapUrl,
    metaTitle,
    metaDescription: String(b.metaDescription || '').trim(),
    heroBadge: String(b.heroBadge || '').trim(),
    heroDescription: String(b.heroDescription || '').trim(),
    openingHours: String(b.openingHours || '').trim(),
    heroVideoUrl: String(b.heroVideoUrl || '').trim(),
    footerTagline: String(b.footerTagline || '').trim(),
    contactTitle: String(b.contactTitle || '').trim(),
  };
}
