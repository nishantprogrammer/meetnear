import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minWidth: 64,
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  iconRight: {
    marginRight: 0,
    marginLeft: 8,
  },
  fullWidth: {
    width: '100%',
  },
});

export default styles;
