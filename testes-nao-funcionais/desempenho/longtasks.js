/*
 * Monitor de FPS, Long Tasks e heap para os testes de desempenho do Excalidraw.
 *
 * COMO USAR (Console do Chrome DevTools, na aba do Excalidraw):
 *   1. Recarregue a aba, importe o arquivo de carga e ajuste a visão (Shift+1).
 *   2. Cole este script no Console. (Só depois da importação, para o
 *      carregamento do arquivo não contar como Long Task do cenário.)
 *   3. Imediatamente antes do gesto do cenário:   excalidrawPerf.iniciar(10)
 *      (10 s no CT-01/CT-02, 15 s no CT-03: para sozinho e imprime o resumo.
 *      Sem argumento, coleta até você chamar finalizar().)
 *   4. Faça o gesto durante esse tempo. Só chame finalizar() se usou iniciar()
 *      sem argumento.
 *   5. Anote o resumo exibido (FPS médio, FPS mínimo, Long Tasks, maior duração).
 *   Para a memória, a qualquer momento:           excalidrawPerf.heapMB()
 *
 * Como o FPS é medido:
 *  - Conta os quadros entregues ao requestAnimationFrame entre iniciar() e
 *    finalizar(). Quando a thread principal está ocupada, os quadros demoram e
 *    o FPS cai. Por isso a janela deve cobrir SÓ o gesto: com a página parada,
 *    o navegador continua entregando ~60 quadros/s e a média sobe.
 *  - fpsMedio: (quadros - 1) / duração da janela.
 *  - fpsMin: menor FPS entre os blocos completos de 1 s da janela. Se a
 *    janela tiver menos de 1 s, é igual ao fpsMedio.
 *  - piorQuadroMs: maior intervalo entre dois quadros seguidos.
 *  - Se a aba ficar em segundo plano, o navegador pausa o requestAnimationFrame
 *    e a medição fica inválida. Mantenha a aba visível.
 *  - Isso mede a disponibilidade da thread principal, não substitui o medidor
 *    "Frame Rendering Stats" do DevTools. Cite o método usado no relatório.
 *
 * Long Tasks:
 *  - Não usa `buffered`: só conta tarefas entre iniciar() e finalizar().
 *  - Long Task = tarefa da thread principal com mais de 50 ms (Long Tasks API, W3C).
 *
 * Heap:
 *  - performance.memory é exclusivo do Chrome e vem arredondado. Para valores
 *    precisos, abra o Chrome com --enable-precise-memory-info e informe isso
 *    no relatório (seção de ambiente).
 */
(() => {
  // Remove uma instância anterior, se o script for colado duas vezes.
  window.excalidrawPerf?.cancelar?.();

  const temLongTask =
    PerformanceObserver.supportedEntryTypes?.includes("longtask");
  if (!temLongTask) {
    console.warn("Long Tasks API indisponível: só o FPS será medido.");
  }

  let observer = null;
  let tarefas = [];
  let quadros = [];
  let rafId = null;
  let timerId = null;
  let ativo = false;
  let t0 = 0;

  const registrar = (e) =>
    tarefas.push({
      inicioMs: Math.round(e.startTime - t0),
      duracao: Math.round(e.duration),
    });

  const loopQuadros = (ts) => {
    quadros.push(ts);
    rafId = requestAnimationFrame(loopQuadros);
  };

  const calcularFps = () => {
    if (quadros.length < 2) {
      return { quadros: quadros.length, fpsMedio: null, fpsMin: null, piorQuadroMs: null };
    }
    const primeiro = quadros[0];
    const duracaoMs = quadros[quadros.length - 1] - primeiro;
    const fpsMedio = ((quadros.length - 1) / duracaoMs) * 1000;

    let piorQuadroMs = 0;
    for (let i = 1; i < quadros.length; i++) {
      piorQuadroMs = Math.max(piorQuadroMs, quadros[i] - quadros[i - 1]);
    }

    // Blocos completos de 1 s
    const blocos = Math.floor(duracaoMs / 1000);
    let fpsMin = fpsMedio;
    if (blocos >= 1) {
      const contagem = new Array(blocos).fill(0);
      for (const ts of quadros) {
        const b = Math.floor((ts - primeiro) / 1000);
        if (b < blocos) contagem[b]++;
      }
      fpsMin = Math.min(...contagem);
    }
    return {
      quadros: quadros.length,
      janelaFpsMs: duracaoMs,
      fpsMedio,
      fpsMin,
      piorQuadroMs,
    };
  };

  window.excalidrawPerf = {
    // iniciar()      -> coleta até você chamar finalizar().
    // iniciar(10)    -> para sozinho após 10 s e imprime o resumo (também fica
    //                   guardado em excalidrawPerf.ultimo). Use 10 nos cenários
    //                   CT-01/CT-02 e 15 no CT-03, para a janela ser exata.
    iniciar(segundos) {
      this.cancelar();
      tarefas = [];
      quadros = [];
      t0 = performance.now();
      ativo = true;
      if (segundos > 0) {
        timerId = setTimeout(() => {
          timerId = null;
          this.ultimo = this.finalizar();
        }, segundos * 1000);
      }
      if (temLongTask) {
        observer = new PerformanceObserver((lista) =>
          lista.getEntries().forEach(registrar),
        );
        observer.observe({ type: "longtask" }); // sem buffered
      }
      rafId = requestAnimationFrame(loopQuadros);
      console.log("Coleta iniciada (FPS e Long Tasks). Faça o gesto e chame finalizar().");
    },

    finalizar() {
      if (!ativo) {
        console.warn("Coleta não iniciada. Use excalidrawPerf.iniciar().");
        return null;
      }
      const janelaMs = performance.now() - t0;
      if (observer) {
        // takeRecords() pega entradas ainda não entregues ao callback.
        observer.takeRecords().forEach(registrar);
        observer.disconnect();
        observer = null;
      }
      cancelAnimationFrame(rafId);
      rafId = null;
      ativo = false;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }

      const duracoes = tarefas.map((t) => t.duracao);
      const fps = calcularFps();
      const r = {
        fpsMedio: fps.fpsMedio === null ? null : +fps.fpsMedio.toFixed(1),
        fpsMin: fps.fpsMin === null ? null : +fps.fpsMin.toFixed(1),
        piorQuadroMs: fps.piorQuadroMs === null ? null : Math.round(fps.piorQuadroMs),
        quadros: fps.quadros,
        longTasks: tarefas.length,
        maiorLongTaskMs: duracoes.length ? Math.max(...duracoes) : 0,
        somaLongTasksMs: duracoes.reduce((a, b) => a + b, 0),
        janelaMs: Math.round(janelaMs),
      };
      if (tarefas.length) console.table(tarefas);
      console.log(
        `FPS médio: ${r.fpsMedio} | FPS mín (blocos de 1 s): ${r.fpsMin} | ` +
          `pior quadro: ${r.piorQuadroMs} ms | Long Tasks: ${r.longTasks} ` +
          `(maior ${r.maiorLongTaskMs} ms) | janela: ${r.janelaMs} ms`,
      );
      if (r.janelaMs < 8000 || r.janelaMs > 20000) {
        console.warn(
          `Janela de ${r.janelaMs} ms: confira se bate com a duração do cenário (10 s ou 15 s).`,
        );
      }
      return r;
    },

    cancelar() {
      observer?.disconnect();
      observer = null;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      if (timerId !== null) clearTimeout(timerId);
      timerId = null;
      ativo = false;
    },

    heapMB() {
      const m = performance.memory;
      if (!m) {
        console.warn("performance.memory indisponível.");
        return null;
      }
      const usado = +(m.usedJSHeapSize / 1048576).toFixed(1);
      console.log(
        `JS Heap usado: ${usado} MB (total alocado: ${(m.totalJSHeapSize / 1048576).toFixed(1)} MB)`,
      );
      return usado;
    },
  };

  console.log("excalidrawPerf pronto: iniciar() / finalizar() / heapMB().");
})();
