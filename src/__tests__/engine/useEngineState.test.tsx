import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useEngineState } from '@/engine/hooks/useEngineState';

const DummyA: React.FC<{ slug: string }> = ({ slug }) => {
  const [state, setState] = useEngineState({ sections: [] } as any, slug, 'A');
  const inc = () => setState(prev => ({ ...(prev || {}), counter: ((prev as any)?.counter || 0) + 1 }));
  return (
    <div>
      <button onClick={inc}>inc</button>
      <div data-testid="a-counter">{(state as any)?.counter || 0}</div>
    </div>
  );
};

const DummyB: React.FC<{ slug: string }> = ({ slug }) => {
  const [state] = useEngineState({ sections: [] } as any, slug, 'A');
  return <div data-testid="b-counter">{(state as any)?.counter || 0}</div>;
};

describe('useEngineState sync', () => {
  it('syncs state across instances in the same window', () => {
    render(
      <div>
        <DummyA slug="sync-test" />
        <DummyB slug="sync-test" />
      </div>
    );

    const incBtn = screen.getByText('inc');
    const a = screen.getByTestId('a-counter');
    const b = screen.getByTestId('b-counter');

    expect(a.textContent).toBe('0');
    expect(b.textContent).toBe('0');

    fireEvent.click(incBtn);

    // after clicking, both should reflect updated value
    expect(a.textContent).toBe('1');
    expect(b.textContent).toBe('1');
  });
});