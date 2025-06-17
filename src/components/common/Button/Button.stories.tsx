import React from 'react';
import { View } from 'react-native';
import Button from './index';

export default {
  title: 'Components/Button',
  component: Button,
  decorators: [
    Story => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export const Default = {
  args: {
    title: 'Button',
    onPress: () => console.log('Pressed'),
  },
};

export const Variants = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button title="Contained" variant="contained" onPress={() => {}} />
      <Button title="Outlined" variant="outlined" onPress={() => {}} />
      <Button title="Text" variant="text" onPress={() => {}} />
    </View>
  ),
};

export const Sizes = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button title="Small" size="small" onPress={() => {}} />
      <Button title="Medium" size="medium" onPress={() => {}} />
      <Button title="Large" size="large" onPress={() => {}} />
    </View>
  ),
};

export const Colors = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button title="Primary" color="primary" onPress={() => {}} />
      <Button title="Secondary" color="secondary" onPress={() => {}} />
      <Button title="Success" color="success" onPress={() => {}} />
      <Button title="Error" color="error" onPress={() => {}} />
      <Button title="Warning" color="warning" onPress={() => {}} />
      <Button title="Info" color="info" onPress={() => {}} />
    </View>
  ),
};

export const WithIcon = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button title="Add Item" icon="add" iconPosition="left" onPress={() => {}} />
      <Button title="Next" icon="arrow-forward" iconPosition="right" onPress={() => {}} />
    </View>
  ),
};

export const States = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button title="Normal" onPress={() => {}} />
      <Button title="Disabled" disabled onPress={() => {}} />
      <Button title="Loading" loading onPress={() => {}} />
    </View>
  ),
};

export const FullWidth = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button title="Full Width Button" fullWidth onPress={() => {}} />
    </View>
  ),
};
