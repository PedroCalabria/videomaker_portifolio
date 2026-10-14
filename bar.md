# bar.md — régua do crítico de craft

Referências combinadas:
- **Cor e tipografia:** as duas imagens enviadas (TERRAIN e ASC): concreto claro, grafite, um laranja de sinal e grotesca em caixa-alta.
- **Estrutura e movimento:** Morphic (styles.refero.design + morphic.com ao vivo):
  - hero em duas colunas com título em dois tons e dois CTAs;
  - fileiras horizontais de cards de mídia com setas;
  - transições curtas e mecânicas.

O azul e a Inter do Morphic **não** entram, porque cor e fonte vêm das imagens.

Cada linha abaixo é verificável olhando o render.

1. **Título em dois tons, grande.** Todo título de seção tem 2–3 linhas em caixa-alta, e a última linha é de outra cor (cinza apagado ou laranja, nunca as duas no mesmo título). No desktop (1440px), o título do hero é ≥ 5× o corpo de texto (≥ 88px contra 16–18px). No mobile (375px), é ≥ 3×.

2. **Um único acento, contado.** Laranja aparece no máximo 3 vezes por viewport: um CTA preenchido, uma linha de título ou índice, e um detalhe gráfico. Não há nenhuma outra matiz na interface (fotos/vídeos à parte).

3. **Conversão acima da dobra.** Em 1440×900 e em 375×812, sem rolar, aparecem: o título, uma frase de proposta de valor e o CTA principal ("Agendar conversa" ou equivalente). No desktop, aparece também um CTA secundário ao lado. O CTA principal é o elemento de maior contraste da primeira tela.

4. **Grid técnico aparente.** Colunas e blocos são separados por linhas de 1px visíveis. Cada seção tem pelo menos um metadado mono em micro caixa-alta (índice `/ 0N`, rótulo entre `[ ]`, timecode ou coordenada). Cantos são retos, exceto o chanfro a 45° em no máximo um bloco de destaque por tela.

5. **Fileira de mídia em proporção nativa.** Os projetos aparecem numa fileira horizontal rolável com controles de seta. Os cards de formatos diferentes (9:16 ao lado de 16:9 ou 1:1) ficam lado a lado na mesma altura, sem corte para um formato único. Cada card mostra o formato como metadado.

6. **Ritmo claro/escuro.** A página alterna seções claras de concreto (#EDECE9) com pelo menos duas faixas de largura total quase pretas (por exemplo stats/pacotes e footer). Nunca duas faixas escuras seguidas.

7. **Movimento mecânico.** Toda entrada resolve numa única direção (de baixo para cima ou da esquerda para a direita), acontece uma vez e dura 600–900ms, sem bounce, rotação ou elástico. As linhas de título entram por máscara com atraso escalonado visível entre linhas. Em ≤ 640px não há pin nem parallax, só fade e deslocamento curto.
