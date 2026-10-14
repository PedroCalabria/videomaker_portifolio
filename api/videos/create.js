// POST /api/videos/create  { title }
// Só para o dono logado. Cria o vídeo no Bunny e devolve o que o navegador
// precisa para enviar o arquivo direto ao Bunny por TUS (a chave nunca sai do servidor).
import { bunny, env, readJson, requireAdmin, route, send, tusSignature } from '../_lib.js';

const UPLOAD_WINDOW_S = 6 * 60 * 60; // a doc recomenda pelo menos 1 h; 6 h cobre conexões lentas

export default route(['POST'], async (req, res) => {
  await requireAdmin(req);
  const { title } = await readJson(req);
  const video = await bunny('/videos', { method: 'POST', body: JSON.stringify({ title: String(title || 'Projeto').slice(0, 200) }) });
  const libraryId = env('BUNNY_LIBRARY_ID');
  const expires = Math.floor(Date.now() / 1000) + UPLOAD_WINDOW_S;
  send(res, 200, {
    videoId: video.guid,
    libraryId,
    expires,
    signature: tusSignature({ libraryId, apiKey: env('BUNNY_API_KEY'), expires, videoId: video.guid }),
    endpoint: 'https://video.bunnycdn.com/tusupload',
  });
});
