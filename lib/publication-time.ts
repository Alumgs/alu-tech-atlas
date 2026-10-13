/** Do not invent a clock time for a source that supplied only a calendar date. */
export function publicationLabel(value:string):string{
  if(!Number.isFinite(Date.parse(value)))return '发布时间未提供';
  if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value+'（原文仅提供日期）';
  return new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})+' 北京时间';
}
