import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from './index';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    const { getByTestId } = render(<Button title="Test Button" onPress={() => {}} loading />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays icon when provided', () => {
    const { getByTestId } = render(<Button title="Test Button" onPress={() => {}} icon="add" />);
    expect(getByTestId('button-icon')).toBeTruthy();
  });

  it('applies disabled state correctly', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} disabled />);
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies different variants correctly', () => {
    const { getByText, rerender } = render(
      <Button title="Test Button" onPress={() => {}} variant="contained" />
    );
    expect(getByText('Test Button')).toHaveStyle({ backgroundColor: expect.any(String) });

    rerender(<Button title="Test Button" onPress={() => {}} variant="outlined" />);
    expect(getByText('Test Button')).toHaveStyle({ borderWidth: 1 });

    rerender(<Button title="Test Button" onPress={() => {}} variant="text" />);
    expect(getByText('Test Button')).toHaveStyle({ backgroundColor: 'transparent' });
  });

  it('applies different sizes correctly', () => {
    const { getByText, rerender } = render(
      <Button title="Test Button" onPress={() => {}} size="small" />
    );
    expect(getByText('Test Button')).toHaveStyle({ paddingVertical: expect.any(Number) });

    rerender(<Button title="Test Button" onPress={() => {}} size="large" />);
    expect(getByText('Test Button')).toHaveStyle({ paddingVertical: expect.any(Number) });
  });
});
