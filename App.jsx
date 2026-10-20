import { useEffect, useRef } from 'react';
import './App.css';

const contactEmail = 'd3bruyn@gmail.com';
// Cole aqui o link do vídeo do detector de codornas no LinkedIn (o botão só aparece com o link preenchido)
const quailVideoUrl = '';
const whatsappLink = `https://wa.me/5527998281915?text=${encodeURIComponent('Olá, Gustavo! Vi seu portfólio e gostaria de conversar.')}`;

const areas = [
  { title: 'Testes de segurança (pentest)', text: 'Simulo ataques de forma autorizada para encontrar falhas em sites, redes e sistemas antes que alguém mal-intencionado as encontre.' },
  { title: 'Desenvolvimento de sistemas', text: 'Crio sites e sistemas completos, do visual que o usuário vê até o banco de dados, pensando em segurança desde o início.' },
  { title: 'Ambientes Linux', text: 'Uso Linux no dia a dia, o sistema presente na maioria dos servidores e das ferramentas de segurança.' },
];

const languages = [
  { name: 'JavaScript', use: 'Reformulação do VixCursos', status: 'Experiência prática' },
  { name: 'TypeScript', use: 'Projetos de front-end', status: 'Em estudo' },
  { name: 'Rust', use: 'Projetos de sistemas', status: 'Autodidata' },
  { name: 'SQL', use: 'Banco de dados do Caça Verbos (PostgreSQL)', status: 'Formação na Estácio' },
  { name: 'Python', use: 'Scripts de automação e testes', status: 'Uso ocasional' },
];

const projects = [
  { title: 'Detector de codornas', description: 'Sistema de visão computacional que identifica codornas em imagens e vídeos, baseado no YOLO26, um modelo de detecção de objetos em tempo real.', tech: ['YOLO26', 'Visão computacional', 'IA'], link: { label: 'Ver vídeo no LinkedIn', href: quailVideoUrl } },
  { title: 'VixCursos', description: 'Reformulação do sistema de cursos da Prefeitura de Vitória, para melhorar a experiência do usuário e aumentar as inscrições.', tech: ['HTML', 'CSS', 'JavaScript'] },
  { title: 'Caça Verbos', description: 'Software educacional interativo para o aprendizado infantil, com banco de dados estruturado e interface dinâmica.', tech: ['React', 'CSS', 'SQL'] },
];

const icon = (path) => `https://unpkg.com/devicon@2.14.0/icons/${path}.svg`;

const stack = [
  { name: 'React', logo: icon('react/react-original') },
  { name: 'HTML', logo: icon('html5/html5-original') },
  { name: 'CSS', logo: icon('css3/css3-original') },
  { name: 'JavaScript', logo: icon('javascript/javascript-original') },
  { name: 'Node.js', logo: icon('nodejs/nodejs-original') },
  { name: 'MySQL', logo: icon('mysql/mysql-original') },
  { name: 'PostgreSQL', logo: icon('postgresql/postgresql-original') },
  { name: 'Python', logo: icon('python/python-original') },
  { name: 'Criação de IA' },
];

const social = [
  ['LinkedIn', 'https://www.linkedin.com/in/gustavo-de-bruyn-73155330a/'],
  ['GitHub', 'https://github.com/Cat1hh'],
  ['Instagram', 'https://www.instagram.com/d3_bruyn/'],
];

// Item do carrossel de ferramentas (sem logo, mostra um ícone de rede neural)
function StackItem({ name, logo, copy }) {
  return (
    <li className={copy ? 'stack-item copy' : 'stack-item'} aria-hidden={copy || undefined}>
      {logo ? (
        <img src={logo} alt="" width="28" height="28" loading="lazy" />
      ) : (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="6" cy="14" r="2.5" /><circle cx="22" cy="7" r="2.5" /><circle cx="22" cy="21" r="2.5" /><circle cx="14" cy="14" r="2.5" />
          <path d="M8.5 14h3M16 12.5l4-4M16 15.5l4 4" />
        </svg>
      )}
      <span>{name}</span>
    </li>
  );
}

// Fundo animado: rede de pontos que reage ao mouse
function NetworkBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, dots = [], raf = 0, visible = true;

    const resize = () => {
      const r = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const widthChanged = r.width !== w;
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (widthChanged || !dots.length) {
        const count = Math.round(Math.min(90, (w * h) / 14000));
        dots = Array.from({ length: count }, () => ({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        }));
      }
    };

    const line = (a, b, alpha) => {
      ctx.strokeStyle = 'rgba(138,180,255,' + alpha + ')';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (!reduce) {
        for (const d of dots) {
          d.x += d.vx; d.y += d.vy;
          if (d.x < 0 || d.x > w) d.vx *= -1;
          if (d.y < 0 || d.y > h) d.vy *= -1;
          // os pontos se afastam de leve do cursor
          const dx = d.x - mouse.x, dy = d.y - mouse.y, m = Math.hypot(dx, dy);
          if (m > 0 && m < 90) {
            const f = (90 - m) / 90;
            d.x = Math.min(w, Math.max(0, d.x + (dx / m) * f * 1.2));
            d.y = Math.min(h, Math.max(0, d.y + (dy / m) * f * 1.2));
          }
        }
      }
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        ctx.fillStyle = 'rgba(138,180,255,0.7)';
        ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(a.x - dots[j].x, a.y - dots[j].y);
          if (dist < 120) line(a, dots[j], (1 - dist / 120) * 0.3);
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 170) line(a, mouse, (1 - dm / 170) * 0.6);
      }
    };

    const loop = () => { if (visible) draw(); raf = requestAnimationFrame(loop); };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = mouse.y = -9999; };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(); });
    io.observe(canvas); ro.observe(parent);
    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);
    resize(); draw();
    if (!reduce) loop();

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} className="net" aria-hidden="true" />;
}

export default function App() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#top">Gustavo de Bruyn</a>
        <nav aria-label="Principal">
          <a href="#areas">O que faço</a>
          <a href="#projetos">Projetos</a>
          <a href="#tecnologias">Tecnologias</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero dark">
          <NetworkBackground />
          <div className="wrap hero-inner">
            <div>
              <p className="status">Disponível para novos projetos</p>
              <h1>Gustavo de Bruyn</h1>
              <p className="role">Especialista em segurança digital e desenvolvimento de sistemas</p>
              <p className="summary">
                Encontro falhas de segurança em sites e sistemas antes que se tornem um problema,
                e também desenvolvo soluções completas com React, Node.js, SQL e Rust.
              </p>
              <div className="actions">
                <a className="btn primary" href="#projetos">Ver projetos</a>
                <a className="btn" href="#contato">Entrar em contato</a>
              </div>
            </div>

            <div className="term" aria-hidden="true">
              <div className="term-bar"><i /><i /><i /></div>
              <p><b>$</b> analisar-sistema</p>
              <p className="ok">Falhas encontradas</p>
              <p className="ok">Correções recomendadas</p>
              <p className="ok">Sistema mais seguro</p>
            </div>
          </div>
        </section>

        <section id="ferramentas" className="stack section">
          <div className="wrap"><h2>Ferramentas que uso</h2></div>
          <div className="marquee">
            <ul className="track">
              {stack.map((x) => <StackItem key={x.name} {...x} />)}
              {stack.map((x) => <StackItem key={`${x.name}-copia`} {...x} copy />)}
            </ul>
          </div>
        </section>

        <section id="areas" className="section wrap">
          <h2>O que faço</h2>
          <div className="grid">
            {areas.map((a) => (
              <article key={a.title} className="card">
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="projetos" className="section wrap">
          <h2>Projetos</h2>
          <div className="grid two">
            {projects.map((p) => (
              <article key={p.title} className="card">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <ul className="tags">
                  {p.tech.map((t) => <li key={t}>{t}</li>)}
                </ul>
                {p.link?.href && (
                  <a className="btn" href={p.link.href} target="_blank" rel="noopener noreferrer">{p.link.label}</a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="tecnologias" className="section wrap">
          <h2>Tecnologias</h2>
          <p className="intro">Linguagens de programação que uso e onde as apliquei.</p>
          <ul className="lang-list">
            {languages.map((l) => (
              <li key={l.name} className="lang-row">
                <strong className="lang-name">{l.name}</strong>
                <span className="lang-use">{l.use}</span>
                <span className="lang-status">{l.status}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer id="contato" className="footer dark">
        <NetworkBackground />
        <div className="wrap">
          <h2>Vamos conversar?</h2>
          <p className="avail">Disponível de segunda a sexta, em Serra e região ou remoto.</p>
          <div className="actions">
            <a className="btn primary" href={`mailto:${contactEmail}`}>Enviar e-mail</a>
            <a className="btn" href={whatsappLink} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
          </div>
          <p className="mail">{contactEmail}</p>
          <ul className="social">
            {social.map(([name, href]) => (
              <li key={name}><a href={href} target="_blank" rel="noopener noreferrer">{name}</a></li>
            ))}
          </ul>
          <small>© 2026 Gustavo de Bruyn</small>
        </div>
      </footer>
    </>
  );
}