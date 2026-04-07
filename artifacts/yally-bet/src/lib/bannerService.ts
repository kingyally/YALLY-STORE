export interface Banner {
  id: string;
  image_url: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

const BANNERS_KEY = 'yallybet_banners';

export async function fetchBanners(): Promise<Banner[]> {
  try {
    const data = localStorage.getItem(BANNERS_KEY);
    if (!data) return [];
    return JSON.parse(data) as Banner[];
  } catch {
    return [];
  }
}

export async function fetchActiveBannerUrls(): Promise<string[]> {
  const banners = await fetchBanners();
  const active = banners.filter(b => b.active);
  return active.map(b => b.image_url);
}

export async function addBanner(imageUrl: string, sortOrder: number): Promise<Banner | null> {
  const banners = await fetchBanners();
  const banner: Banner = {
    id: `banner_${Date.now()}`,
    image_url: imageUrl,
    sort_order: sortOrder,
    active: true,
    created_at: new Date().toISOString(),
  };
  banners.push(banner);
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
  return banner;
}

export async function updateBanner(id: string, updates: Partial<Pick<Banner, 'image_url' | 'sort_order' | 'active'>>): Promise<boolean> {
  const banners = await fetchBanners();
  const idx = banners.findIndex(b => b.id === id);
  if (idx === -1) return false;
  banners[idx] = { ...banners[idx], ...updates };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
  return true;
}

export async function deleteBanner(id: string): Promise<boolean> {
  const banners = await fetchBanners();
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners.filter(b => b.id !== id)));
  return true;
}

export async function uploadBannerImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
