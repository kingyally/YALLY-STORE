import { api } from './apiClient';

export interface Banner {
  id: string;
  image_url: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export async function fetchBanners(): Promise<Banner[]> {
  try {
    const r = await api<{ banners: Banner[] }>('/banners');
    return r.banners;
  } catch {
    return [];
  }
}

export async function fetchActiveBannerUrls(): Promise<string[]> {
  const banners = await fetchBanners();
  return banners.filter(b => b.active).map(b => b.image_url);
}

export async function addBanner(imageUrl: string, sortOrder: number): Promise<Banner | null> {
  try {
    const r = await api<{ banner: Banner }>('/banners', {
      method: 'POST',
      body: { image_url: imageUrl, sort_order: sortOrder },
    });
    return r.banner;
  } catch {
    return null;
  }
}

export async function updateBanner(id: string, updates: Partial<Pick<Banner, 'image_url' | 'sort_order' | 'active'>>): Promise<boolean> {
  try {
    await api(`/banners/${encodeURIComponent(id)}`, { method: 'PUT', body: updates });
    return true;
  } catch {
    return false;
  }
}

export async function deleteBanner(id: string): Promise<boolean> {
  try {
    await api(`/banners/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  } catch {
    return false;
  }
}

export async function uploadBannerImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
