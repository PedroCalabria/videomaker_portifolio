// Movimento mecânico (design system Concreto): entradas numa direção, uma vez,
// 600–900ms, sem bounce. Em telas ≤ 640px só fade e deslocamento curto.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'power2.out'; // saída suave; a curva do sistema assenta cedo demais no olho
const START = 'top 80%'; // dispara a 20% do viewport

function once(el, vars, from) {
  return gsap.fromTo(el, from, {
    ...vars,
    scrollTrigger: { trigger: vars.trigger || el, start: START, once: true },
    trigger: undefined,
  });
}

function scramble(el) {
  const final = el.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·:';
  el.setAttribute('aria-label', final);
  const obj = { p: 0 };
  return gsap.to(obj, {
    p: 1,
    duration: 0.3,
    ease: 'none',
    scrollTrigger: { trigger: el, start: START, once: true },
    onUpdate() {
      const n = Math.floor(obj.p * final.length);
      el.textContent = final.slice(0, n) + final.slice(n).replace(/[^\s·]/g, () => chars[(Math.random() * chars.length) | 0]);
    },
    onComplete() {
      el.textContent = final;
    },
  });
}

export function setupMotion(root) {
  const params = new URLSearchParams(window.location.search);
  if (params.has('nomotion')) return () => {};

  const mm = gsap.matchMedia(root);
  const q = (s) => gsap.utils.toArray(root.querySelectorAll(s));

  mm.add(
    {
      full: '(min-width: 641px) and (prefers-reduced-motion: no-preference)',
      small: '(max-width: 640px) and (prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { full, small, reduce } = ctx.conditions;

      if (reduce) {
        q('[data-title], [data-reveal], [data-group] > *, [data-group-x] > *, [data-image]').forEach((el) =>
          once(el, { opacity: 1, duration: 0.2 }, { opacity: 0 })
        );
        return;
      }

      // Títulos: máscara linha a linha, de baixo para cima, 80ms entre linhas.
      q('[data-title]').forEach((t) => {
        const inners = t.querySelectorAll('.dt__inner');
        if (full) once(inners, { yPercent: 0, duration: 0.9, ease: EASE, stagger: 0.12, delay: 0.1, trigger: t }, { yPercent: 105 });
        else once(inners, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.1, delay: 0.1, trigger: t }, { opacity: 0, y: 16 });
      });

      // Divisórias desenhadas antes do conteúdo.
      q('[data-line]').forEach((l) => once(l, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, { scaleX: 0, transformOrigin: 'left center' }));
      if (full) q('[data-line-v]').forEach((l, i) => once(l, { scaleY: 1, duration: 0.8, delay: i * 0.08, ease: 'power2.inOut' }, { scaleY: 0, transformOrigin: 'top center' }));

      q('[data-reveal]').forEach((el) =>
        once(el, { opacity: 1, y: 0, duration: 0.7, ease: EASE, delay: 0.45 }, { opacity: 0, y: full ? 24 : 12 })
      );

      q('[data-group]').forEach((g) =>
        once(g.children, { opacity: 1, y: 0, duration: 0.6, ease: EASE, stagger: 0.1, trigger: g }, { opacity: 0, y: full ? 24 : 12 })
      );

      // Fileira horizontal: entra da esquerda para a direita.
      q('[data-group-x]').forEach((g) =>
        once(g.children, { opacity: 1, x: 0, duration: 0.7, ease: EASE, stagger: 0.1, trigger: g }, { opacity: 0, x: full ? 48 : 16 })
      );

      // Imagens: clip-path de baixo para cima + scale 1.08 → 1.
      q('[data-image]').forEach((el) => {
        if (full) {
          once(el, { clipPath: 'inset(0% 0 0% 0)', duration: 0.9, ease: 'power2.inOut', delay: 0.2 }, { clipPath: 'inset(100% 0 0% 0)' });
          const media = el.querySelector('[data-media]');
          if (media) once(media, { scale: 1, duration: 1.2, ease: EASE, delay: 0.2, trigger: el }, { scale: 1.08 });
        } else {
          once(el, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, { opacity: 0, y: 16 });
        }
      });

      // Números contando por 1.2s.
      q('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count);
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: START, once: true },
          onUpdate: () => (el.textContent = Math.round(o.v)),
        });
      });

      if (full) q('[data-scramble]').forEach(scramble);

      // Parallax do still do hero, máximo 60px, só no desktop.
      if (full) {
        q('[data-parallax]').forEach((el) =>
          gsap.to(el, { y: -60, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
        );
      }
    }
  );

  return () => mm.revert();
}

export function refreshMotion() {
  ScrollTrigger.refresh();
}
