// Ponte: o arquivo UMD do GSAP registra window.gsap; aqui ele vira módulo ES.
import './gsap.js';
const gsap = window.gsap;
export default gsap;
export { gsap };
