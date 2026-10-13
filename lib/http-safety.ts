export class RequestError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
/** Limit actual bytes, including chunked bodies without a Content-Length header. */
export async function boundedText(body: {body: ReadableStream<Uint8Array> | null; headers: Headers}, maxBytes: number): Promise<string> {
  const length = Number(body.headers.get('Content-Length'));
  if (Number.isFinite(length) && length > maxBytes) {
    await body.body?.cancel();
    throw new RequestError('请求或来源内容超过读取上限。', 413);
  }
  if (!body.body) return '';
  const reader = body.body.getReader(), decoder = new TextDecoder();
  let bytes = 0, text = '';
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new RequestError('请求或来源内容超过读取上限。', 413);
      text += decoder.decode(value, {stream: true});
    }
    return text + decoder.decode();
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
}
export async function boundedJson(request: Request, maxBytes = 20000): Promise<Record<string, unknown>> {
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new RequestError('请使用 JSON 请求格式。', 415);
  let value: unknown;
  try { value = JSON.parse(await boundedText(request, maxBytes)); }
  catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError('请求内容不是有效的 JSON。');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RequestError('请求必须是 JSON 对象。');
  return value as Record<string, unknown>;
}
