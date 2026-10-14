// GET /api/videos/status?id=<videoId>
// Só para o dono. Informa se o Bunny terminou de converter o vídeo enviado.
import { assertVideoId, bunny, query, requireAdmin, route, send } from '../_lib.js';

// Status do objeto de vídeo na API do Bunny. Para não depender de um único número,
// o vídeo é considerado pronto quando o status indica "finalizado" OU o progresso chega a 100%.
const FINISHED = 4;
const FAILED = new Set([5, 6]);

export default route(['GET'], async (req, res) => {
  await requireAdmin(req);
  const v = await bunny(`/videos/${assertVideoId(query(req).id)}`);
  const progress = Math.max(0, Math.min(100, Number(v.encodeProgress) || 0));
  const state = FAILED.has(v.status) ? 'failed' : v.status === FINISHED || progress >= 100 ? 'ready' : 'processing';
  send(res, 200, {
    state,
    progress,
    duration: Math.round(Number(v.length) || 0),
    width: v.width || 0,
    height: v.height || 0,
    rawStatus: v.status,
  });
});
