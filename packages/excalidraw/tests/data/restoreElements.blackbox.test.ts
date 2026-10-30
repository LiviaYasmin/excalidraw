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
});
