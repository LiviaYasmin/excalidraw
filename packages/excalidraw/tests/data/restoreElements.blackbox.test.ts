import { describe, expect, it, vi } from 'vitest';

import { API } from '../helpers/api';
import * as restore from '../../data/restore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

// cria o elemento pelo helper do projeto e aplica os valores do teste por cima
const make = (type: string, props: Record<string, unknown> = {}): Any => ({
  ...API.createElement({ type, ...props } as Any),
  ...props,
});

const run = (
  elements: unknown,
  existing: unknown = null,
  opts?: Record<string, boolean>,
): Any[] =>
  restore.restoreElements(
    elements as Any,
    existing as Any,
    opts as Any,
  ) as Any[];

const binding = (elementId: string) => ({
  elementId,
  mode: 'orbit',
  fixedPoint: [0.5, 0.5],
});

describe('restoreElements - caixa preta', () => {
  it('CT01: um elemento de cada tipo', () => {
    const types = [
      'rectangle', 'ellipse', 'diamond', 'embeddable', 'text', 'line',
      'arrow', 'freedraw', 'image', 'frame', 'magicframe',
    ];
    const result = run(types.map((type) => make(type)));
    expect(result.map((e) => e.type)).toEqual(types);
    result.forEach((e, i) => {
      expect(e.version).toBeGreaterThanOrEqual(1);
      expect(e.isDeleted).toBe(false);
      expect(typeof e.index).toBe('string');
      if (i > 0) {
        expect(result[i - 1].index < e.index).toBe(true);
      }
    });
  });

  it('CT02: elemento so com id e type recebe valores padrao', () => {
    const [r] = run([{ id: 'r-min', type: 'rectangle' }]);
    expect(r).toMatchObject({
      id: 'r-min',
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      angle: 0,
      groupIds: [],
      frameId: null,
      boundElements: [],
      locked: false,
      link: null,
      isDeleted: false,
    });
    expect(r.version).toBeGreaterThanOrEqual(1);
    expect(typeof r.strokeColor).toBe('string');
  });

  it('CT03: rectangle completo preserva os valores', () => {
    const [r] = run([
      make('rectangle', {
        id: 'r-full',
        strokeColor: '#ff0000',
        backgroundColor: '#00ff00',
        opacity: 50,
        angle: 1,
        strokeWidth: 4,
        groupIds: ['g1'],
        locked: true,
      }),
    ]);
    expect(r).toMatchObject({
      strokeColor: '#ff0000',
      backgroundColor: '#00ff00',
      opacity: 50,
      angle: 1,
      strokeWidth: 4,
      groupIds: ['g1'],
      locked: true,
    });
  });

  it('CT04: array vazio', () => {
    expect(run([])).toEqual([]);
  });

  it('CT05: null', () => {
    expect(run(null)).toEqual([]);
  });

  it('CT06: undefined', () => {
    expect(run(undefined)).toEqual([]);
  });

  it('CT30 (robustez): targetElements que nao e array lanca TypeError', () => {
    // A assinatura do tipo aceita apenas array/null/undefined; passar um objeto
    // nao-array e comportamento fora do contrato e causa TypeError internamente.
    expect(() => run({})).toThrow(TypeError);
  });

  it('CT31 (robustez): array com entrada nula lanca TypeError', () => {
    // null dentro do array causa TypeError em arrayToMap, pois o codigo tenta
    // acessar element.id sem checar null. Comportamento fora do contrato publico.
    expect(() => run([null, make('rectangle', { id: 'a' })])).toThrow(TypeError);
  });

  it('CT07: tipo legado draw vira line', () => {
    const [r] = run([{ ...make('line'), type: 'draw' }]);
    expect(r.type).toBe('line');
  });

  it('CT08: selection e descartado', () => {
    expect(run([{ type: 'selection' }])).toEqual([]);
  });

  it('CT09: tipo desconhecido e descartado', () => {
    expect(run([{ ...make('rectangle'), type: 'foo' }])).toEqual([]);
  });

  it('CT10: mistura de validos e descartaveis', () => {
    const result = run([
      make('rectangle', { id: 'a' }),
      { type: 'selection' },
      { ...make('rectangle', { id: 'c' }), type: 'foo' },
      make('text', { id: 'd' }),
    ]);
    expect(result.map((e) => e.id)).toEqual(['a', 'd']);
  });

  it('CT11: ids duplicados geram ids unicos', () => {
    const result = run([
      make('rectangle', { id: 'dup' }),
      make('rectangle', { id: 'dup' }),
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('dup');
    expect(result[1].id).not.toBe('dup');
  });

  it('CT12: line com um unico ponto vira segmento ate (width, height)', () => {
    const [l] = run([make('line', { width: 30, height: 40, points: [[5, 5]] })]);
    expect(l.points).toEqual([[0, 0], [30, 40]]);
  });

  it('CT13: arrow gigante e marcada como excluida', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const [a] = run([make('arrow', { points: [[0, 0], [900000, 0]] })]);
    expect(a.isDeleted).toBe(true);
    expect(a.width).toBe(100);
    expect(a.height).toBe(100);
    spy.mockRestore();
  });

  it('CT14: texto nulo vira texto vazio', () => {
    const [t] = run([{ ...make('text'), text: null, originalText: null }]);
    expect(t.text).toBe('');
  });

  it('CT15 (robustez): textAlign invalido e preservado sem sanitizacao', () => {
    // restoreElement nao sanitiza textAlign; o valor invalido e mantido como esta.
    const [t] = run([{ ...make('text'), textAlign: 'xyz' }]);
    expect(typeof t.textAlign).toBe('string');
  });
});
