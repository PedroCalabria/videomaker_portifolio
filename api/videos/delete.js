// DELETE /api/videos/delete?id=<videoId>
// Só para o dono. Remove o vídeo da biblioteca do Bunny (chamado ao remover um projeto
// ou ao trocar o vídeo de um formato).
import { assertVideoId, bunny, query, requireAdmin, route, send } from '../_lib.js';

export default route(['DELETE'], async (req, res) => {
  await requireAdmin(req);
  const id = assertVideoId(query(req).id);
  try {
    await bunny(`/videos/${id}`, { method: 'DELETE' });
  } catch (e) {
    if (e.status !== 404) throw e; // já não existe: tudo certo
  }
  send(res, 200, { ok: true });
});
