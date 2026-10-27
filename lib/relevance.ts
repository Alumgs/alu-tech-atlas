import type {Domain,News} from './content';
// Content evidence only: publisher names and feed categories never establish relevance.
const domainEvidence:Record<Domain,RegExp>={
 aidc:/\b(?:data[ -]?cent(?:er|re)s?|AI factor(?:y|ies)|GPUs?|TPUs?|HBM|NVLink|RDMA|InfiniBand|Blackwell|Rubin|accelerators?|server racks?)\b|液冷|智算|服务器|数据中心|算力|昇腾|光模块|超节点/i,
 robot:/\b(?:robots?|robotics|robotic|humanoids?|embodied|Isaac|GR00T|manipulation|grasping|world models?|V-JEPA|DreamerV?3)\b|机器人|具身|机械臂|人形|世界模型|运动控制|抓取/i,
 ml:/\b(?:AI|LLMs?|machine learning|deep learning|language models?|neural networks?|transformers?|fine[ -]?tuning|quantization|distillation|RAG|inference|pretraining|DeepSeek|Qwen|ChatGPT|Claude|Gemini)\b|大模型|智能体|机器学习|人工智能|深度学习|预训练|推理|量化|蒸馏|通义|千问/i,
};
const noise=/\b(?:coupon|giveaway|horoscope|celebrity gossip|sponsored advertorial)\b|优惠券|抽奖送|星座运势|明星八卦|软文推广/i;
export const worldTopics:Array<[string,string,RegExp]>=[
 ['国际时事','World affairs',/\b(?:wars?|conflicts?|elections?|diploma\w*|peace|ceasefire|military|displaced|displacement|genocide|Israel\w*|Palestin\w*|Gaza|Ukraine|refugees?|UN celebrates|United Nations anniversary)\b|战争|冲突|选举|外交|国际|停火|流离失所|种族清洗|以色列|巴勒斯坦|联合国周年|难民/i],
 ['经济与金融','Economy & finance',/\b(?:econom\w*|inflation|interest rates?|central banks?|banks?|trade|tariffs?|markets?|finance|financial|GDP|recession|stocks?|bonds?|monetary|earnings)\b|经济|通胀|利率|银行|贸易|关税|金融|财报|股市|货币政策|证券|基金|融资|营收|涨停|A股|沪指|创业板|债券|汇率|降息|降准|财政|消费|投资|产业链|增长|就业|房地产|楼市|GDP/i],
 ['能源与气候','Energy & climate',/\b(?:energy|oil|natural gas|climate|carbon|electricity|renewables?|emissions?|drought|floods?)\b|能源|石油|天然气|气候|电力|碳排|洪水|干旱/i],
 ['科技与科学','Technology & science',/\b(?:technolog\w*|science|scientific|scientists?|space|chips?|AI|researchers?|satellites?|NASA|quantum)\b|科技|科学|科研|太空|芯片|人工智能|卫星|量子/i],
 ['社会与公共政策','Society & policy',/\b(?:health|education|schools?|hospitals?|public policy|population|humanitarian|human rights|poverty|disease|vaccin\w*|housing)\b|健康|教育|条例|法规|办法|国务院|公共政策|人口|人道|人权|贫困|疾病|疫苗|住房/i],
 ['国内热议','China discussions',/电竞|足球|篮球|比赛|体育|金球奖|瑞士轮|世界杯|电影|演唱会/i],
];
export function worldTopic(n:Pick<News,'title'|'summary'|'worldCategory'>):string|null{
 // Title defines the principal subject; summary can supply evidence only if title is inconclusive.
 for(const text of [n.title,n.summary||'']){
  const match=worldTopics.find(([, ,pattern])=>pattern.test(text));if(match)return match[0];
 }
 return n.worldCategory||null;
}
export function relevance(n:Pick<News,'title'|'summary'>,domain:Domain){
 if(noise.test(n.title))return 0;
 return domainEvidence[domain].test(n.title)?100:domainEvidence[domain].test(n.summary||'')?65:0;
}
export function relevantDomains(n:Pick<News,'title'|'summary'>):Domain[]{return (['aidc','robot','ml'] as Domain[]).filter(d=>relevance(n,d)>=65);}
export function eligible(n:News){return n.scope==='world'?!!worldTopic(n)&&!noise.test(n.title):relevance(n,n.domain)>=65;}
/** Re-evaluate old caches as well as freshly fetched reports. */
export function classifyNews(n:News):News{return n.scope==='world'?{...n,worldCategory:worldTopic(n)||'其他动态',type:contentType(n)}:n;}

/** Content form is independent of the subject taxonomy. */
export function contentType(n:Pick<News,'title'|'type'|'url'>){
 if(n.type==='社区热议')return n.type;
 const title=n.title;
 if(/政策|条例|法规|指导意见|行动方案|实施方案|征求意见|管理办法|通知|监管|regulation|legislation|monetary policy/i.test(title)||/gov\.cn\/zhengce\//.test(n.url))return '政策法规';
 return n.type;
}
