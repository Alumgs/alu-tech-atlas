import type {News} from './content';

/**
 * A deliberately transparent, rule-based editorial score. It prioritizes recency,
 * primary-source proximity, information type and summary completeness; it is not
 * an LLM verdict or a claim that facts have been independently verified.
 */
export function scoreNews(n: News, now = Date.now()): number {
  const published = Date.parse(n.date);
  const ageDays = Number.isFinite(published) ? Math.max(0, (now - published) / 86_400_000) : 45;
  const recency = Math.round(28 * Math.exp(-ageDays / 24));
  const typeScore: Record<string, number> = {
    '研究论文': 24, '技术研究': 23, '企业财报': 22, '产品发布': 20,
    '市场洞察': 15, '政策法规': 21, '行业活动': 8,
  };
  const kind = String(n.sourceKind || '');
  const source = String(n.source || '') + ' ' + String(n.feed || '');
  let sourceScore = 10;
  if (/官方直连|官方来源|primary|first.party/i.test(kind) || /官方|政府|部委|研究院|arxiv|nvidia developer|investor relations|sec edgar|iea\b/i.test(source)) sourceScore = 25;
  else if (/媒体直连|专业媒体|独立媒体/i.test(kind)) sourceScore = 17;
  else if (/新闻聚合|聚合/i.test(kind) || /news.google.com/i.test(String(n.url))) sourceScore = 7;
  const summary = (n.summary || '').trim();
  const completeness = summary.length >= 120 ? 11 : summary.length >= 60 ? 8 : summary.length >= 25 ? 4 : 0;
  const specificity = /\d/.test(n.title) ? 3 : 0;
  const penalty = (n.stale ? 12 : 0) + (n.historical ? 10 : 0);
  return Math.max(0, Math.min(100, (typeScore[n.type] ?? 12) + recency + sourceScore + completeness + specificity - penalty));
}

export function scoreReasons(n: News, now = Date.now()): string[] {
  const reasons: string[] = [];
  const age = (now - Date.parse(n.date)) / 86_400_000;
  if (Number.isFinite(age) && age <= 7) reasons.push('近 7 天发布');
  const kind = String(n.sourceKind || '');
  const source = String(n.source || '') + ' ' + String(n.feed || '');
  if (/官方直连|官方来源|primary|first.party/i.test(kind) || /官方|政府|部委|研究院|arxiv|nvidia developer|investor relations|sec edgar|iea\b/i.test(source)) reasons.push('一手/专业来源优先');
  if (['研究论文','技术研究','企业财报','产品发布','政策法规'].includes(n.type)) reasons.push('具备技术或产业决策价值');
  if ((n.summary || '').trim().length >= 60) reasons.push('有可读摘要');
  if (n.stale || n.historical) reasons.push('历史/缓存内容，发布前需复核');
  return reasons.slice(0, 3);
}

function normalizeTitle(title: string): string {
  return title.toLocaleLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[^\p{L}\p{N}]/gu, '');
}

function bigrams(value: string): Set<string> {
  const chars = Array.from(value);
  const out = new Set<string>();
  if (chars.length < 2) return new Set(chars);
  for (let i = 0; i < chars.length - 1; i++) out.add(chars[i] + chars[i + 1]);
  return out;
}

function similarTitle(a: string, b: string): boolean {
  const na = normalizeTitle(a), nb = normalizeTitle(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (Math.min(Array.from(na).length, Array.from(nb).length) < 14) return false;
  const aa = bigrams(na), bb = bigrams(nb);
  let common = 0;
  for (const part of aa) if (bb.has(part)) common++;
  return common / Math.max(1, aa.size + bb.size - common) >= 0.86;
}

/** Deduplicates identical URLs and very similar titles, preferring stronger sources. */
export function dedupeStories(items: News[], now = Date.now()): News[] {
  const ranked = [...items].sort((a, b) => scoreNews(b, now) - scoreNews(a, now) || Date.parse(b.date) - Date.parse(a.date));
  const seenUrls = new Set<string>();
  const accepted: News[] = [];
  for (const item of ranked) {
    const url = String(item.url || '').trim();
    if (!url || seenUrls.has(url)) continue;
    if (accepted.some(existing => existing.domain === item.domain && similarTitle(existing.title, item.title))) continue;
    seenUrls.add(url);
    accepted.push(item);
  }
  return accepted;
}

export function rankNews(items: News[], now = Date.now()): News[] {
  return dedupeStories(items, now).sort((a, b) => scoreNews(b, now) - scoreNews(a, now) || Date.parse(b.date) - Date.parse(a.date));
}
