export type SiteSettings = {
  siteTitle: string;
  tagline: string;
  announcement: string;
  accentColor: string;
  pageBackground: string;
  fontScale: number;
  compactNews: boolean;
  showOverviewMetrics: boolean;
  showMarketChart: boolean;
  enableEditorialDesk: boolean;
};

export const defaultSiteSettings: SiteSettings = {
  siteTitle: '知域',
  tagline: '从算力基础设施到机器人与机器学习',
  announcement: '',
  accentColor: '#087d69',
  pageBackground: '#ffffff',
  fontScale: 1,
  compactNews: false,
  showOverviewMetrics: true,
  showMarketChart: true,
  enableEditorialDesk: true,
};

const text = (value: unknown, fallback: string, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : fallback;
const color = (value: unknown, fallback: string) =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;

export function sanitizeSiteSettings(value: unknown): SiteSettings {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const font = Number(source.fontScale);
  return {
    siteTitle: text(source.siteTitle, defaultSiteSettings.siteTitle, 36) || defaultSiteSettings.siteTitle,
    tagline: text(source.tagline, defaultSiteSettings.tagline, 100),
    announcement: text(source.announcement, '', 240),
    accentColor: color(source.accentColor, defaultSiteSettings.accentColor),
    pageBackground: color(source.pageBackground, defaultSiteSettings.pageBackground),
    fontScale: Number.isFinite(font) ? Math.max(0.9, Math.min(1.15, Math.round(font * 100) / 100)) : 1,
    compactNews: source.compactNews === true,
    showOverviewMetrics: source.showOverviewMetrics !== false,
    showMarketChart: source.showMarketChart !== false,
    enableEditorialDesk: source.enableEditorialDesk !== false,
  };
}
