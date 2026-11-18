// "Fuja da refação": joguinho da página 404. O cursor do site corre e pula os pedidos de refação.
// Canvas puro, sem biblioteca; só é carregado na 404. Espaço, seta para cima, clique ou toque para pular.

const PEDIDOS = ['AUMENTA O LOGO', 'PRAZO: ONTEM', 'V3_FINAL', 'REFAÇÃO', 'JOB URGENTE', 'MAIS UMA OPÇÃO', 'DÁ UM UP'];

export function iniciarJogo(canvas: HTMLCanvasElement, placar: HTMLElement, aviso: HTMLElement) {
  const ctx = canvas.getContext('2d')!;
  const css = getComputedStyle(document.documentElement);
  const cor = (v: string, padrao: string) => css.getPropertyValue(v).trim() || padrao;
  const TINTA = cor('--tinta', '#000');
  const CANETA = cor('--caneta', '#1f2bd1');
  const LINHA = cor('--linha', '#bfc1ba');
  const FONTE = getComputedStyle(document.body).getPropertyValue('--display') || 'sans-serif';

  const cursor = new Image();
  cursor.src = '/cursor/seta.png?v=2';

  // tamanho lógico fixo em altura; a largura acompanha o container
  const ALTURA = 220;
  const CHAO = 180;
  let largura = 0;
  const ajustar = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    largura = canvas.clientWidth;
    canvas.width = Math.round(largura * dpr);
    canvas.height = Math.round(ALTURA * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    desenhar();
  };

  type Obstaculo = { x: number; w: number; h: number; texto: string };
  let estado: 'parado' | 'jogando' | 'fim' = 'parado';
  let y = 0; // altura do cursor acima do chão
  let vy = 0;
  let velocidade = 0;
  let pontos = 0;
  let distancia = 0;
  let proximo = 0;
  let obstaculos: Obstaculo[] = [];
  let ultimo = 0;
  let raf = 0;
  let recorde = 0;
  try {
    recorde = Number(localStorage.getItem('kb-refacao') ?? 0);
  } catch {}

  const P = { x: 56, w: 28, h: 28 };

  const mostrarPlacar = () => {
    placar.textContent = `${pontos} ${pontos === 1 ? 'refação evitada' : 'refações evitadas'}, recorde ${recorde}`;
  };

  const novoObstaculo = (): Obstaculo => {
    const texto = PEDIDOS[Math.floor(Math.random() * PEDIDOS.length)];
    ctx.font = `800 18px ${FONTE}`;
    const w = Math.ceil(ctx.measureText(texto).width) + 14;
    return { x: largura + 20, w, h: 30, texto };
  };

  const comecar = () => {
    estado = 'jogando';
    y = 0;
    vy = 0;
    velocidade = 260;
    pontos = 0;
    distancia = 0;
    proximo = 300;
    obstaculos = [];
    ultimo = 0;
    aviso.hidden = true;
    mostrarPlacar();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(quadro);
  };

  const pular = () => {
    if (estado !== 'jogando') return comecar();
    // pulo longo o bastante para passar o pedido mais comprido já na velocidade inicial
    if (y === 0) vy = 690;
  };

  const terminar = () => {
    estado = 'fim';
    if (pontos > recorde) {
      recorde = pontos;
      try {
        localStorage.setItem('kb-refacao', String(recorde));
      } catch {}
    }
    mostrarPlacar();
    aviso.textContent = 'Reprovado. Espaço ou toque para tentar de novo.';
    aviso.hidden = false;
    desenhar();
  };

  function quadro(t: number) {
    const dt = ultimo ? Math.min((t - ultimo) / 1000, 0.05) : 0;
    ultimo = t;
    // física do pulo
    vy -= 1750 * dt;
    y = Math.max(0, y + vy * dt);
    if (y === 0) vy = 0;
    // mundo andando, cada vez mais rápido
    velocidade += 6 * dt;
    distancia += velocidade * dt;
    if (distancia >= proximo) {
      obstaculos.push(novoObstaculo());
      proximo = distancia + 320 + Math.random() * 380 + velocidade * 0.6;
    }
    for (const o of obstaculos) o.x -= velocidade * dt;
    const antes = obstaculos.length;
    obstaculos = obstaculos.filter((o) => o.x + o.w > -10);
    pontos += antes - obstaculos.length;
    if (antes !== obstaculos.length) mostrarPlacar();
    // colisão com folga de 4 px para não ser injusto
    const topo = CHAO - y - P.h;
    const bateu = obstaculos.some(
      (o) => P.x + P.w - 4 > o.x && P.x + 4 < o.x + o.w && topo + P.h - 4 > CHAO - o.h,
    );
    desenhar();
    if (bateu) return terminar();
    raf = requestAnimationFrame(quadro);
  }

  function desenhar() {
    if (!largura) return;
    ctx.clearRect(0, 0, largura, ALTURA);
    // chão
    ctx.strokeStyle = LINHA;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CHAO + 1);
    ctx.lineTo(largura, CHAO + 1);
    ctx.stroke();
    // pedidos de refação: caixa na cor de destaque com o texto em papel
    ctx.font = `800 18px ${FONTE}`;
    ctx.textBaseline = 'middle';
    for (const o of obstaculos) {
      ctx.fillStyle = CANETA;
      ctx.fillRect(o.x, CHAO - o.h, o.w, o.h);
      ctx.fillStyle = '#e4e5e0';
      ctx.fillText(o.texto, o.x + 8, CHAO - o.h / 2 + 1);
    }
    // o cursor do site
    const topo = CHAO - y - P.h;
    if (cursor.complete && cursor.naturalWidth) ctx.drawImage(cursor, P.x, topo, P.w, P.h);
    else {
      ctx.fillStyle = TINTA;
      ctx.fillRect(P.x, topo, P.w, P.h);
    }
  }

  // controles: espaço e seta para cima (só quando o jogo está na tela), clique e toque no canvas
  const visivel = () => {
    const r = canvas.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  };
  addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && visivel() && !(e.target as Element)?.closest?.('a, button, input, textarea')) {
      e.preventDefault();
      pular();
    }
  });
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pular();
  });
  addEventListener('resize', ajustar);
  cursor.addEventListener('load', desenhar);
  document.fonts?.ready.then(desenhar);
  ajustar();
  mostrarPlacar();
}
