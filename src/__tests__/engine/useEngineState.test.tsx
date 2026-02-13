import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useEngineState } from '@/engine/hooks/useEngineState';
import { globalEventBus } from '@/engine/events/EventBus';
import { EVENT_TYPES } from '@/engine/events/types';

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

describe('useEngineState event-driven updates', () => {
  it('updates state when STATE_UPDATED events are emitted', async () => {
    render(
      <div>
        <DummyA slug="event-test" />
        <DummyB slug="event-test" />
      </div>
    );

    const a = screen.getByTestId('a-counter');
    const b = screen.getByTestId('b-counter');

    expect(a.textContent).toBe('0');
    expect(b.textContent).toBe('0');

    // Emit a STATE_UPDATED event
    await act(async () => {
      await globalEventBus.emit(EVENT_TYPES.STATE_UPDATED, {
        type: EVENT_TYPES.STATE_UPDATED,
        key: 'counter',
        value: 42,
        source: 'test',
      });
      // Wait a bit for the event to propagate
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Both components should reflect the updated value
    expect(a.textContent).toBe('42');
    expect(b.textContent).toBe('42');
  });

  it('emits STATE_UPDATED events when state is set directly', async () => {
    const mockEmit = vi.fn().mockResolvedValue(undefined);
    const originalEmit = globalEventBus.emit;
    globalEventBus.emit = mockEmit;

    render(<DummyA slug="emit-test" />);

    const incBtn = screen.getByText('inc');

    await act(async () => {
      fireEvent.click(incBtn);
    });

    // Should have emitted a STATE_UPDATED event
    expect(mockEmit).toHaveBeenCalledWith(EVENT_TYPES.STATE_UPDATED, {
      type: EVENT_TYPES.STATE_UPDATED,
      key: 'counter',
      value: 1,
      previousValue: undefined,
      source: 'useEngineState',
    });

    // Restore original emit
    globalEventBus.emit = originalEmit;
  });
});