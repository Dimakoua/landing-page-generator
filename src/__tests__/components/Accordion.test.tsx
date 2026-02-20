import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Accordion from '@/components/accordion/Accordion';

describe('Accordion component', () => {
  const safeRender = (ui: React.ReactElement) => {
    let result: ReturnType<typeof render>;
    act(() => {
      result = render(ui);
    });
    return result!;
  }
  it('renders string content and toggles open/close', () => {
    safeRender(
      <Accordion
        items={[{ id: 'a1', title: 'FAQ', content: 'This is an answer.' }]}
      />
    );

    expect(screen.getByText('FAQ')).toBeInTheDocument();
    // content hidden initially
    expect(screen.queryByText('This is an answer.')).toBeNull();

    fireEvent.click(screen.getByText('FAQ'));
    expect(screen.getByText('This is an answer.')).toBeInTheDocument();
  });

  it('renders structured spec list correctly', () => {
    safeRender(
      <Accordion
        items={[
          {
            id: 'specs',
            title: 'Audio Performance',
            content: [
              { label: 'Driver Size', value: '40mm Dynamic Drivers' },
              { label: 'Frequency Response', value: '20Hz - 20kHz' },
            ],
          },
        ]}
      />
    );

    // open
    fireEvent.click(screen.getByText('Audio Performance'));

    expect(screen.getByText('Driver Size')).toBeInTheDocument();
    expect(screen.getByText('40mm Dynamic Drivers')).toBeInTheDocument();
    expect(screen.getByText('Frequency Response')).toBeInTheDocument();
    expect(screen.getByText('20Hz - 20kHz')).toBeInTheDocument();
  });
});