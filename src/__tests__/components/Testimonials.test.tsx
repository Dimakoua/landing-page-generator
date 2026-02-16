import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Testimonials from '@/components/testimonials/Testimonials';

const testimonials = [
  {
    id: '1',
    rating: 5,
    content: 'Great product',
    name: 'Alice Johnson',
    role: 'Verified Buyer',
    company: 'Tech Corp',
    image: 'alice.jpg'
  },
  {
    id: '2',
    rating: 5,
    content: 'Fantastic experience',
    name: 'Bob Smith',
    role: 'Music Producer',
    image: 'bob.jpg'
  },
  {
    id: '3',
    rating: 4.5,
    content: 'Solid build quality',
    name: 'Charlie Brown',
    role: 'Verified Buyer',
    image: 'charlie.jpg'
  },
];

describe('Testimonials component', () => {
  describe('Grid display mode', () => {
    it('renders testimonials in grid layout by default', () => {
      render(<Testimonials testimonials={testimonials} />);

      expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
      expect(screen.getByText('Great product')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Fantastic experience')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    it('renders custom title and subtitle', () => {
      render(<Testimonials
        testimonials={testimonials}
        title="Customer Reviews"
        subtitle="See what our users are saying"
      />);

      expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
      expect(screen.getByText('See what our users are saying')).toBeInTheDocument();
    });

    it('renders star ratings correctly', () => {
      render(<Testimonials testimonials={testimonials} />);

      // Material Icons are rendered as <span class="material-icons">star|star_half|star_border</span>
      const iconSpans = document.querySelectorAll('.material-icons');
      expect(iconSpans.length).toBeGreaterThan(0);
      // Ensure at least one of the spans contains a star-related icon name
      const hasStarIcon = Array.from(iconSpans).some(el => /^(?:star|star_half|star_border)$/.test(el.textContent || ''));
      expect(hasStarIcon).toBe(true);
    });

    it('handles testimonials without images', () => {
      const testimonialsNoImages = testimonials.map(t => ({ ...t, image: undefined }));
      render(<Testimonials testimonials={testimonialsNoImages} />);

      // Should still render without crashing
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    it('handles testimonials with missing role/company', () => {
      const testimonialsMinimal = [{
        content: 'Good product',
        name: 'Test User'
      }];
      render(<Testimonials testimonials={testimonialsMinimal} />);

      expect(screen.getByText('Good product')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Verified Buyer')).toBeInTheDocument(); // Default fallback
    });
  });

  describe('Carousel display mode', () => {
    it('renders single testimonial in carousel mode', () => {
      render(<Testimonials testimonials={testimonials} displayMode="carousel" />);

      // Should show first testimonial
      expect(screen.getByText('Great product')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

      // Should not show other testimonials initially
      expect(screen.queryByText('Fantastic experience')).not.toBeInTheDocument();
    });

    it('navigates between testimonials with controls', () => {
      render(<Testimonials testimonials={testimonials} displayMode="carousel" />);

      // Initial state - first testimonial
      expect(screen.getByText('Great product')).toBeInTheDocument();

      // Click next button
      const nextButton = screen.getByLabelText('Next testimonial');
      fireEvent.click(nextButton);

      // Should show second testimonial
      expect(screen.getByText('Fantastic experience')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();

      // Click previous button
      const prevButton = screen.getByLabelText('Previous testimonial');
      fireEvent.click(prevButton);

      // Should show first testimonial again
      expect(screen.getByText('Great product')).toBeInTheDocument();
    });

    it('handles navigation at boundaries', () => {
      render(<Testimonials testimonials={testimonials} displayMode="carousel" />);

      // Go to last testimonial
      const nextButton = screen.getByLabelText('Next testimonial');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByText('Solid build quality')).toBeInTheDocument();

      // Click next again - should wrap to first
      fireEvent.click(nextButton);
      expect(screen.getByText('Great product')).toBeInTheDocument();

      // Click previous - should go to last
      const prevButton = screen.getByLabelText('Previous testimonial');
      fireEvent.click(prevButton);
      expect(screen.getByText('Solid build quality')).toBeInTheDocument();
    });

    it('renders dot indicators for navigation', () => {
      render(<Testimonials testimonials={testimonials} displayMode="carousel" />);

      // Should have 3 dot indicators
      const dots = screen.getAllByLabelText(/Go to testimonial/);
      expect(dots).toHaveLength(3);
    });

    it('allows direct navigation via dots', () => {
      render(<Testimonials testimonials={testimonials} displayMode="carousel" />);

      const dots = screen.getAllByLabelText(/Go to testimonial/);

      // Click third dot
      fireEvent.click(dots[2]);

      expect(screen.getByText('Solid build quality')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });
  });

  describe('Single display mode', () => {
    it('renders only the first testimonial', () => {
      render(<Testimonials testimonials={testimonials} displayMode="single" />);

      expect(screen.getByText('Great product')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

      // Should not show other testimonials
      expect(screen.queryByText('Fantastic experience')).not.toBeInTheDocument();
      expect(screen.queryByText('Solid build quality')).not.toBeInTheDocument();
    });
  });

  describe('Grid layout variations', () => {
    it('renders 1 column grid', () => {
      render(<Testimonials testimonials={testimonials} itemsPerRow={1} />);

      // Should have grid-cols-1 class or similar — scope by heading
      const section = screen.getByRole('heading', { name: 'What Our Customers Say' }).closest('section');
      const gridContainer = section?.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('renders 2 column grid', () => {
      render(<Testimonials testimonials={testimonials} itemsPerRow={2} />);

      const section = screen.getByRole('heading', { name: 'What Our Customers Say' }).closest('section');
      const gridContainer = section?.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('renders 3 column grid by default', () => {
      render(<Testimonials testimonials={testimonials} />);

      const section = screen.getByRole('heading', { name: 'What Our Customers Say' }).closest('section');
      const gridContainer = section?.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('renders 4 column grid', () => {
      render(<Testimonials testimonials={testimonials} itemsPerRow={4} />);

      const section = screen.getByRole('heading', { name: 'What Our Customers Say' }).closest('section');
      const gridContainer = section?.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty testimonials array', () => {
      render(<Testimonials testimonials={[]} />);

      // Should render title but no testimonials
      expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
    });

    it('handles single testimonial in carousel mode', () => {
      render(<Testimonials testimonials={[testimonials[0]]} displayMode="carousel" />);

      expect(screen.getByText('Great product')).toBeInTheDocument();

      // Should not show navigation controls for single testimonial
      expect(screen.queryByLabelText('Next testimonial')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Previous testimonial')).not.toBeInTheDocument();
    });

    it('renders partial testimonial data', () => {
      const partialTestimonials = [{
        content: 'Good',
        name: 'User'
      }];
      render(<Testimonials testimonials={partialTestimonials} />);

      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });
});