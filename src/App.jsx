import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createStore } from './lib/store.js';
import { setupMotion } from './lib/motion.js';
import { Hero, MobileCta, Nav, Stats } from './sections/Header.jsx';
import { Work } from './sections/Work.jsx';
import { Testimonials } from './sections/Testimonials.jsx';
import { Packages, Plans } from './sections/Offers.jsx';
import { Faq, FinalCta, Footer } from './sections/Closing.jsx';
import Admin from './admin/Admin.jsx';
import { Icon } from './components/ui.jsx';

function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash.startsWith('#/admin') ? 'admin' : 'site';
}

export default function App() {
  const [store, setStore] = useState(null);
  const [projects, setProjects] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [lead, setLead] = useState({ interest: '', slot: '', name: '', phone: '', message: '' });
  const route = useRoute();
  const rootRef = useRef(null);

  useEffect(() => {
    let unsub = () => {};
    createStore().then((s) => {
      setStore(s);
      unsub = s.subscribeProjects(setProjects, () => setProjects([]));
      s.canEdit().then(setCanEdit);
      s.auth?.onChange(() => s.canEdit().then(setCanEdit));
    });
    return () => unsub();
  }, []);

  // A permissão pode depender da URL (#/admin no modo local): reavalia ao trocar de rota.
  useEffect(() => {
    store?.canEdit().then(setCanEdit);
  }, [store, route]);

  const ready = route === 'site' && store && projects !== null;
  useLayoutEffect(() => {
    if (!ready) return;
    return setupMotion(rootRef.current);
  }, [ready]);

  const onInterest = (interest, message) => setLead((l) => ({ ...l, interest, message: l.message || message }));

  if (route === 'admin') {
    return store ? <Admin store={store} projects={projects || []} canEdit={canEdit} onAuthChanged={() => store.canEdit().then(setCanEdit)} /> : null;
  }

  return (
    <div ref={rootRef} className="site">
      <a className="skip" href="#trabalhos">
        Pular para os trabalhos
      </a>
      <Nav />
      <main>
        <Hero />
        <Testimonials projects={projects} />
        {store && <Work projects={projects} store={store} onInterest={onInterest} />}
        <Stats />
        <Plans onInterest={onInterest} />
        <Packages onInterest={onInterest} />
        <Faq />
        <FinalCta lead={lead} setLead={setLead} />
      </main>
      <MobileCta />
      {canEdit && (
        <button type="button" className="owner-fab" onClick={() => (window.location.hash = '#/admin')}>
          <span className="owner-fab__dot" aria-hidden="true" />
          Editar projetos
          <Icon name="arrow" size={14} />
        </button>
      )}
      <Footer canEdit={canEdit} onAdmin={() => (window.location.hash = '#/admin')} />
    </div>
  );
}
