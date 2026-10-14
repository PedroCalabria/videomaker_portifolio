// Upload TUS 1.0 mínimo (criação + PATCH em blocos), com progresso e nova tentativa por bloco.
// Usado para enviar vídeos direto do navegador ao Bunny Stream, sem passar pela Vercel.
// Equivalente ao tus-js-client para este caso; troque por ele se preferir.

const CHUNK = 8 * 1024 * 1024; // 8 MB por PATCH
const RETRIES = [1000, 3000, 6000];

function xhrPatch(url, headers, blob, onProgress) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('PATCH', url);
    Object.entries(headers).forEach(([k, v]) => x.setRequestHeader(k, v));
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded);
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve(Number(x.getResponseHeader('Upload-Offset'))) : reject(new Error(`TUS ${x.status}`)));
    x.onerror = () => reject(new Error('Falha de rede no envio'));
    x.send(blob);
  });
}

const b64 = (s) => btoa(unescape(encodeURIComponent(s)));

/**
 * @param {File} file
 * @param {{ endpoint: string, headers: Record<string,string>, metadata: Record<string,string>, onProgress?: (pct:number)=>void, signal?: AbortSignal }} o
 */
export async function tusUpload(file, { endpoint, headers, metadata, onProgress = () => {}, signal }) {
  const base = { 'Tus-Resumable': '1.0.0', ...headers };
  const meta = Object.entries(metadata)
    .map(([k, v]) => `${k} ${b64(String(v))}`)
    .join(',');
  const created = await fetch(endpoint, { method: 'POST', headers: { ...base, 'Upload-Length': String(file.size), 'Upload-Metadata': meta }, signal });
  if (created.status !== 201) throw new Error(`Não consegui iniciar o envio (${created.status})`);
  const location = new URL(created.headers.get('Location'), endpoint).toString();

  let offset = 0;
  while (offset < file.size) {
    if (signal?.aborted) throw new Error('Envio cancelado');
    let attempt = 0;
    for (;;) {
      const end = Math.min(offset + CHUNK, file.size);
      try {
        offset = await xhrPatch(location, { ...base, 'Upload-Offset': String(offset), 'Content-Type': 'application/offset+octet-stream' }, file.slice(offset, end), (loaded) =>
          onProgress(Math.min(99, Math.round(((offset + loaded) / file.size) * 100)))
        );
        break;
      } catch (e) {
        if (attempt >= RETRIES.length) throw e;
        await new Promise((r) => setTimeout(r, RETRIES[attempt++]));
        // descobre até onde o servidor recebeu antes de tentar de novo
        const head = await fetch(location, { method: 'HEAD', headers: base }).catch(() => null);
        const o = Number(head?.headers.get('Upload-Offset'));
        if (Number.isFinite(o)) offset = o;
      }
    }
  }
  onProgress(100);
}
