import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Select = ({ label, value, options, onChange, placeholder, error, disabled, style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { colors, spacing, typography } = useTheme();

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = option => {
    onChange(option.value);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text, ...typography.body2 }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.select,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
          disabled && { opacity: 0.5 },
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectText,
            {
              color: selectedOption ? colors.text : colors.textSecondary,
              ...typography.body1,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Icon name="arrow-drop-down" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
      {error && (
        <Text style={[styles.error, { color: colors.error, ...typography.caption }]}>{error}</Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, ...typography.h6 }]}>
                {label}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    {
                      backgroundColor: item.value === value ? `${colors.primary}20` : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: colors.text,
                        ...typography.body1,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Icon name="check" size={24} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  select: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
  },
  error: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionText: {
    flex: 1,
  },
});

Select.propTypes = {
  disabled: PropTypes.bool,
  error: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Select.defaultProps = {
  placeholder: 'Select an option',
  disabled: false,
};

export default Select;
