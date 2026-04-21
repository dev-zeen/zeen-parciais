import { Feather } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {  FlatList, ListRenderItemInfo } from 'react-native';

import { MatchCardFilter } from './MatchCardFilter';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Market } from '@/models/Market';
import { Match } from '@/models/Matches';
import { useGetMarket } from '@/queries/market.query';
import { useGetMatchs } from '@/queries/matches.query';

type FilterMarketByTeamProps = {
  applyFilter: (teams: number[]) => void;
  handleClose: () => void;
  defaultFilters: () => void;
  selectedTeams: number[];
};

export function FilterMarketByTeam({
  applyFilter,
  handleClose,
  defaultFilters,
  selectedTeams,
}: FilterMarketByTeamProps) {
  const colorTheme = useThemeColor();
  const { data: market } = useGetMarket();

  const { data: matches } = useGetMatchs();

  const [selectedsTeams, setSelectedsTeams] = useState<number[]>(selectedTeams || []);

  const handlePressTeam = useCallback(
    (id: number) => {
      const isExists = selectedsTeams.includes(id);

      if (isExists) {
        const selectedsTeamsUpdated = selectedsTeams.filter((teamId) => teamId !== id);
        setSelectedsTeams(selectedsTeamsUpdated);
      } else {
        setSelectedsTeams([...selectedsTeams, id]);
      }
    },
    [selectedsTeams]
  );

  const handlePressFilter = useCallback(() => {
    applyFilter(selectedsTeams);
    handleClose();
  }, [applyFilter, handleClose, selectedsTeams]);

  const renderItem = useCallback(
    ({ item: match }: ListRenderItemInfo<Match>) => {
      return (
        <MatchCardFilter
          market={market as Market}
          match={match}
          selecteds={selectedsTeams}
          handlePressTeam={handlePressTeam}
        />
      );
    },
    [handlePressTeam, market, selectedsTeams]
  );

  const keyExtractor = useCallback((item: Match) => `${item.clube_casa_id}`, []);

  return (
    <SafeAreaViewContainer>
      <View
        className="mx-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <View
          className="rounded-lg p-4"
          style={{
            backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
          }}>
          <View
            className="items-center justify-between flex-row"
            style={{
              gap: 16,
              backgroundColor: 'transparent',
            }}>
            <Text 
              className="font-semibold text-lg"
              style={{ color: colorTheme === 'dark' ? '#f3f4f6' : '#111827' }}>
              Filtrar Por Time
            </Text>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleClose}
              className="p-2 rounded-full"
              style={{
                backgroundColor: colorTheme === 'dark' ? '#7f1d1d' : '#fee2e2',
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#dc2626' : '#fca5a5',
              }}>
              <Feather name="x" size={20} color={colorTheme === 'dark' ? '#fca5a5' : '#dc2626'} />
            </TouchableOpacity>
          </View>
        </View>

        <View 
          className="flex-row px-8 py-3 rounded-lg items-center justify-evenly"
          style={{
            backgroundColor: colorTheme === 'dark' ? '#111827' : '#f9fafb',
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
          }}>
          <Text style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>Mandantes</Text>
          <Text style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>Visitantes</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{
          gap: 8,
          paddingVertical: 8,
          paddingHorizontal: 8,

          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}
        initialNumToRender={10}
        data={matches?.partidas}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />

      <View
        className="flex-row items-center justify-center pt-4 pb-2"
        style={{
          gap: 12,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <TouchableOpacity
          onPress={defaultFilters}
          activeOpacity={0.7}
          className="flex-1 mx-2 p-4 rounded-lg items-center justify-center"
          style={{
            backgroundColor: colorTheme === 'dark' ? '#92400e' : '#fed7aa',
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#f59e0b' : '#fb923c',
          }}>
          <Text 
            className="font-semibold text-sm"
            style={{ color: colorTheme === 'dark' ? '#fef3c7' : '#78350f' }}>
            Limpar Filtros
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={selectedsTeams.length === 0}
          onPress={handlePressFilter}
          activeOpacity={0.7}
          className="flex-1 mx-2 p-4 rounded-lg items-center justify-center"
          style={{
            backgroundColor: selectedsTeams.length === 0 
              ? (colorTheme === 'dark' ? '#374151' : '#e5e7eb')
              : (colorTheme === 'dark' ? '#1e40af' : '#0057FF'),
            borderWidth: 1,
            borderColor: selectedsTeams.length === 0
              ? (colorTheme === 'dark' ? '#4b5563' : '#d1d5db')
              : (colorTheme === 'dark' ? '#0057FF' : '#0057FF'),
            opacity: selectedsTeams.length === 0 ? 0.5 : 1,
          }}>
          <Text className="font-semibold text-sm text-white">Filtrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaViewContainer>
  );
}
