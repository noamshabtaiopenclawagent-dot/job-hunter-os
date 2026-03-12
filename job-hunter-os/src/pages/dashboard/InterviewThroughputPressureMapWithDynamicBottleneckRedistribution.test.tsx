import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InterviewThroughputPressureMapWithDynamicBottleneckRedistribution } from './InterviewThroughputPressureMapWithDynamicBottleneckRedistribution';

describe('InterviewThroughputPressureMapWithDynamicBottleneckRedistribution', () => {
  it('covers C1-C8 including fallback states and redistribution', () => {
    const { rerender } = render(<InterviewThroughputPressureMapWithDynamicBottleneckRedistribution />);
    expect(screen.getByText('Pressure: 94%')).toBeInTheDocument();
    expect(screen.getByText('Bottleneck lane')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Redistribute Bottleneck Load'));
    expect(screen.getByText('Pressure: 79%')).toBeInTheDocument();

    rerender(<InterviewThroughputPressureMapWithDynamicBottleneckRedistribution loading />);
    expect(screen.getByText('Loading throughput pressure map...')).toBeInTheDocument();

    rerender(<InterviewThroughputPressureMapWithDynamicBottleneckRedistribution error="Pressure feed unavailable" />);
    expect(screen.getByText('Pressure feed unavailable')).toBeInTheDocument();

    rerender(<InterviewThroughputPressureMapWithDynamicBottleneckRedistribution data={[]} />);
    expect(screen.getByText('No throughput pressure signals available.')).toBeInTheDocument();
  });
});
