import { View } from 'react-native';
import { ThemeProvider } from '../src/theme';

export const decorators = [
  (Story) => (
    <ThemeProvider>
      <View style={{ flex: 1, padding: 16 }}>
        <Story />
      </View>
    </ThemeProvider>
  ),
];

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}; 