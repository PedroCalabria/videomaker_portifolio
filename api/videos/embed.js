// GET /api/videos/embed?id=<videoId>
// Público. Devolve o link do player com token que expira; fora do prazo
// (ou fora do domínio liberado no Bunny) o link não abre.
// Para o dono ver a prévia antes de salvar o projeto, envie também o login (Authorization).
import { BUNNY_PLAYER, assertVideoId, embedToken, env, httpError, query, requireAdmin, route, send, videoIsPublished } from '../_lib.js';

const TTL_S = 60 * 60; // 1 hora

export default route(['GET'], async (req, res) => {
  const videoId = assertVideoId(query(req).id);
  const published = await videoIsPublished(videoId);
  if (!published) {
    // vídeo ainda não salvo em nenhum projeto: só o dono pode ver
    if (!(req.headers.authorization || '').startsWith('Bearer ')) throw httpError(404, 'Vídeo não encontrado');
    await requireAdmin(req);
  }
  const expires = Math.floor(Date.now() / 1000) + TTL_S;
  const token = embedToken({ tokenKey: env('BUNNY_TOKEN_KEY'), videoId, expires });
  const params = new URLSearchParams({ token, expires: String(expires), autoplay: 'true', preload: 'true', responsive: 'true' });
  send(res, 200, { url: `${BUNNY_PLAYER}/${env('BUNNY_LIBRARY_ID')}/${videoId}?${params}`, expires });
});
