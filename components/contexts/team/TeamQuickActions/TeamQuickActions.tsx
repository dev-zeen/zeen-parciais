import { Feather } from '@expo/vector-icons';
import {  Alert, Text } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

import { listDefaultLineups } from '@/app/(tabs)/team/_team.helpers';
import { View } from '@/components/Themed';
import { Button } from '@/components/structure/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

type TeamQuickActionsProps = {
  onRefresh: () => void;
  onClearAll: () => void;
  disabled?: boolean;
  formation: string;
  onFormationChange: (formationIndex: number) => void;
  onSaveTeam?: () => void;
  showSaveTeam?: boolean;
  disableSaveTeam?: boolean;
};

export function TeamQuickActions({
  onRefresh,
  onClearAll,
  disabled = false,
  formation,
  onFormationChange,
  onSaveTeam,
  showSaveTeam = false,
  disableSaveTeam = false,
}: TeamQuickActionsProps) {
  const colorTheme = useThemeColor();

  const handleClearAll = () => {
    Alert.alert(
      'Limpar Escalação',
      'Tem certeza que deseja remover todos os jogadores? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: onClearAll,
        },
      ]
    );
  };

  return (
    <View
      className={`w-full flex-row items-center justify-between px-2 py-2 rounded-lg ${
        colorTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={{ gap: 8 }}>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <SelectDropdown
          key={formation}
          disabled={disabled}
          dropdownIconPosition="right"
          renderDropdownIcon={(isOpened) => {
            return (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: disabled
                    ? '#e5e7eb'
                    : colorTheme === 'dark'
                    ? '#1e40af'
                    : '#dbeafe',
                }}>
                <Feather
                  name={isOpened ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={disabled ? '#9ca3af' : '#3b82f6'}
                />
              </View>
            );
          }}
          defaultValue={formation}
          defaultButtonText="Formação"
          data={listDefaultLineups()}
          onSelect={(_selectedItem, index) => {
            onFormationChange(index + 1);
          }}
          buttonTextAfterSelection={(selectedItem, _index) => {
            return selectedItem;
          }}
          rowTextForSelection={(item, _index) => {
            return item;
          }}
          renderCustomizedRowChild={(item) => {
            const isSelected = item === formation;
            return (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  backgroundColor: 'transparent',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: 'transparent',
                  }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? '#3b82f6'
                        : colorTheme === 'dark'
                        ? '#374151'
                        : '#f3f4f6',
                    }}>
                    <Feather name="grid" size={18} color={isSelected ? '#ffffff' : '#6b7280'} />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: isSelected ? '700' : '600',
                      color: isSelected
                        ? '#3b82f6'
                        : colorTheme === 'dark'
                        ? '#f3f4f6'
                        : '#1f2937',
                    }}>
                    {item}
                  </Text>
                </View>
                {isSelected && <Feather name="check" size={20} color="#3b82f6" />}
              </View>
            );
          }}
          rowStyle={{
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: colorTheme === 'dark' ? '#374151' : '#f3f4f6',
            height: 64,
            paddingHorizontal: 0,
          }}
          dropdownStyle={{
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
            borderRadius: 16,
            marginTop: -30,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#374151' : '#f3f4f6',
          }}
          buttonStyle={{
            borderRadius: 10,
            width: '100%',
            height: 48,
            backgroundColor: colorTheme === 'dark'
              ? disabled
                ? '#374151'
                : '#1f2937'
              : disabled
              ? '#f3f4f6'
              : '#ffffff',
            paddingHorizontal: 14,
            shadowColor: disabled ? 'transparent' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: disabled ? 0 : 3,
          }}
          buttonTextStyle={{
            fontSize: 16,
            fontWeight: '700',
            color: disabled ? '#9ca3af' : '#3b82f6',
            textAlign: 'left',
            marginLeft: 0,
          }}
        />
      </View>

      {showSaveTeam && onSaveTeam && (
        <Button
          variant={disableSaveTeam ? 'disabled' : 'success'}
          onPress={onSaveTeam}
          disabled={disableSaveTeam}
          onlyIcon
          hasIcon
          iconName="check"
        />
      )}

      <Button variant="primary" onPress={onRefresh} onlyIcon hasIcon iconName="refresh-cw" />

      <Button
        variant={disabled ? 'disabled' : 'error'}
        onPress={handleClearAll}
        disabled={disabled}
        onlyIcon
        hasIcon
        iconName="trash"
      />
    </View>
  );
}
