# Testes não funcionais de desempenho (Excalidraw)

Artefatos usados nos cenários CT-01 a CT-04 do relatório PTOSS-3 (Eficiência de Desempenho: carga, estresse e memória no canvas).

| Arquivo | Para que serve |
|---|---|
| `gerar-cargas.js` | Gera `carga-100.excalidraw`, `carga-1000.excalidraw` e `carga-5000.excalidraw` (retângulos em grade, valores fixos). |
| `cargas/` | Os três arquivos gerados pelo script acima e usados nas medições. |
| `longtasks.js` | Script para colar no Console do Chrome: mede FPS (médio e mínimo), Long Tasks e heap (`excalidrawPerf`). |
| `planilha-coleta-desempenho.xlsx` | Valores de cada execução, médias, limiares e situação de cada cenário. |
| `evidencias/` | Capturas de tela do Console e do painel Performance. |

## Como reproduzir

1. Gerar as cargas (opcional, já estão em `cargas/`):

   ```bash
   node testes-nao-funcionais/desempenho/gerar-cargas.js testes-nao-funcionais/desempenho/cargas
   ```

2. Subir o Excalidraw (`yarn start`) e abrir a aplicação no Chrome.
3. Importar o arquivo do cenário (`Ctrl+O`) e ajustar a visão com `Shift+1`.
4. Colar `longtasks.js` no Console e rodar `excalidrawPerf.iniciar(10)` (10 s no CT-01 e no CT-02, 15 s no CT-03). Fazer o gesto do cenário durante a janela.
5. Ler o heap com `excalidrawPerf.heapMB()`.
6. No CT-04, acionar *Collect garbage* do DevTools antes de cada leitura de heap.

Observações: o `performance.memory` é exclusivo do Chrome. As medições foram feitas em um monitor de aproximadamente 120 Hz, e o CT-02 foi medido sem gravar o painel Performance, porque a gravação derrubava a aba.
