import { Feather } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  TouchableOpacity,
  UIManager,
  View as RNView,
} from 'react-native';

import { Text } from '@/components/Themed';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import type {
  Confronto,
  PointsCompetitionTeam,
  PointsCompetitionTeamsMap,
} from '@/models/Competition';
import { useGetMyClub } from '@/queries/club.query';
import { useGetPointsCompetitionBySlug } from '@/queries/competitions.query';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FormResult = 'V' | 'E' | 'D';

type ProximoConfronto = {
  rodada: number;
  adversario: PointsCompetitionTeam;
  isMandante: boolean;
};

type StandingEntry = PointsCompetitionTeam & {
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gp: number;
  gc: number;
  saldo: number;
  media: number;
  forma: FormResult[];
  proximoConfronto: ProximoConfronto | null;
};

function computeStandings(
  participantes: PointsCompetitionTeamsMap,
  confrontos: Record<string, Confronto[]> | undefined
): StandingEntry[] {
  const stats: Record<
    number,
    {
      pontos: number;
      jogos: number;
      vitorias: number;
      empates: number;
      derrotas: number;
      gp: number;
      gc: number;
      resultados: { rodada: number; result: FormResult }[];
    }
  > = {};

  for (const team of Object.values(participantes)) {
    stats[team.time_id] = {
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      gp: 0,
      gc: 0,
      resultados: [],
    };
  }

  // próximos confrontos: menor rodada com vencedor_id === null por time
  const proximosPorTime: Record<number, { rodada: number; adversarioId: number; isMandante: boolean }> = {};

  if (confrontos) {
    for (const [rodadaStr, matches] of Object.entries(confrontos)) {
      const rodada = parseInt(rodadaStr, 10);
      for (const match of matches) {
        if (match.vencedor_id === null) {
          const { mandante, visitante } = match;
          if (!proximosPorTime[mandante.id] || rodada < proximosPorTime[mandante.id].rodada) {
            proximosPorTime[mandante.id] = { rodada, adversarioId: visitante.id, isMandante: true };
          }
          if (!proximosPorTime[visitante.id] || rodada < proximosPorTime[visitante.id].rodada) {
            proximosPorTime[visitante.id] = { rodada, adversarioId: mandante.id, isMandante: false };
          }
          continue;
        }

        const { mandante, visitante } = match;
        const mStats = stats[mandante.id];
        const vStats = stats[visitante.id];

        if (mStats && mandante.pontos_conquistados !== undefined) {
          mStats.jogos += 1;
          mStats.pontos += mandante.pontos_conquistados;
          if (mandante.pontuacao_rodada !== undefined) mStats.gp += mandante.pontuacao_rodada;
          if (visitante.pontuacao_rodada !== undefined) mStats.gc += visitante.pontuacao_rodada;
          const result: FormResult =
            mandante.pontos_conquistados === 3 ? 'V' : mandante.pontos_conquistados === 1 ? 'E' : 'D';
          if (result === 'V') mStats.vitorias += 1;
          else if (result === 'E') mStats.empates += 1;
          else mStats.derrotas += 1;
          mStats.resultados.push({ rodada, result });
        }

        if (vStats && visitante.pontos_conquistados !== undefined) {
          vStats.jogos += 1;
          vStats.pontos += visitante.pontos_conquistados;
          if (visitante.pontuacao_rodada !== undefined) vStats.gp += visitante.pontuacao_rodada;
          if (mandante.pontuacao_rodada !== undefined) vStats.gc += mandante.pontuacao_rodada;
          const result: FormResult =
            visitante.pontos_conquistados === 3 ? 'V' : visitante.pontos_conquistados === 1 ? 'E' : 'D';
          if (result === 'V') vStats.vitorias += 1;
          else if (result === 'E') vStats.empates += 1;
          else vStats.derrotas += 1;
          vStats.resultados.push({ rodada, result });
        }
      }
    }
  }

  return Object.values(participantes)
    .map((team) => {
      const s = stats[team.time_id] ?? {
        pontos: 0,
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gp: 0,
        gc: 0,
        resultados: [],
      };
      const forma = s.resultados
        .sort((a, b) => b.rodada - a.rodada)
        .slice(0, 5)
        .map((r) => r.result);
      const proximo = proximosPorTime[team.time_id];
      const adversario = proximo ? participantes[proximo.adversarioId] : undefined;
      return {
        ...team,
        pontos: s.pontos,
        jogos: s.jogos,
        vitorias: s.vitorias,
        empates: s.empates,
        derrotas: s.derrotas,
        gp: s.gp,
        gc: s.gc,
        saldo: s.gp - s.gc,
        media: s.jogos > 0 ? s.gp / s.jogos : 0,
        forma,
        proximoConfronto:
          proximo && adversario
            ? { rodada: proximo.rodada, adversario, isMandante: proximo.isMandante }
            : null,
      };
    })
    .sort(
      (a, b) =>
        b.pontos - a.pontos || b.vitorias - a.vitorias || b.saldo - a.saldo || b.gp - a.gp
    );
}

function FormDot({ result }: { result: FormResult }) {
  const color = result === 'V' ? '#22c55e' : result === 'E' ? '#f59e0b' : '#ef4444';
  return <RNView style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />;
}

function StandingRow({
  entry,
  rank,
  isExpanded,
  isMyTeam,
  onToggle,
  isDark,
}: {
  entry: StandingEntry;
  rank: number;
  isExpanded: boolean;
  isMyTeam: boolean;
  onToggle: () => void;
  isDark: boolean;
}) {
  const cardBg = isDark ? '#111827' : '#ffffff';
  const myTeamBg = isDark ? '#0f2318' : '#f0fdf4';
  const borderColor = isMyTeam ? '#22c55e50' : isDark ? '#374151' : '#e5e7eb';
  const statColor = isDark ? '#9ca3af' : '#6b7280';
  const valueColor = isDark ? '#e5e7eb' : '#111827';
  const dividerColor = isDark ? '#1f2937' : '#f3f4f6';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={{
        borderRadius: 12,
        backgroundColor: isMyTeam ? myTeamBg : cardBg,
        borderWidth: 1,
        borderColor,
        overflow: 'hidden',
      }}>
      <RNView style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, gap: 8 }}>
        {/* Rank */}
        <Text
          style={{
            width: 20,
            fontSize: 13,
            fontWeight: '700',
            color: rank <= 4 ? '#22c55e' : statColor,
            textAlign: 'center',
          }}>
          {rank}
        </Text>

        {/* Shield + PRO dot */}
        <RNView style={{ position: 'relative' }}>
          <Image source={{ uri: entry.url_escudo_png }} style={{ width: 36, height: 36, borderRadius: 18 }} />
          {entry.assinante && (
            <RNView
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#f59e0b',
                borderWidth: 1.5,
                borderColor: isMyTeam ? myTeamBg : cardBg,
              }}
            />
          )}
        </RNView>

        {/* Name + cartola */}
        <RNView style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '700', color: valueColor }}>
            {entry.nome}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: statColor }}>
            {entry.nome_cartola}
          </Text>
        </RNView>

        {/* PTS  V  E  D */}
        {([entry.pontos, entry.vitorias, entry.empates, entry.derrotas] as number[]).map((val, i) => (
          <Text
            key={i}
            style={{
              width: 28,
              fontSize: 13,
              fontWeight: i === 0 ? '800' : '600',
              color: i === 0 ? valueColor : statColor,
              textAlign: 'center',
            }}>
            {val}
          </Text>
        ))}

        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={statColor} />
      </RNView>

      {/* Expanded detail */}
      {isExpanded && (
        <RNView style={{ paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: dividerColor, gap: 10 }}>
          <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 10 }}>
            {[
              { label: 'J', value: entry.jogos.toString() },
              { label: 'GP', value: entry.gp.toFixed(2) },
              { label: 'GC', value: entry.gc.toFixed(2) },
              { label: 'SG', value: `${entry.saldo >= 0 ? '+' : ''}${entry.saldo.toFixed(2)}` },
              { label: 'Média', value: `${entry.media.toFixed(1)} pts` },
            ].map(({ label, value }) => (
              <RNView
                key={label}
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 10, color: statColor, marginBottom: 2 }}>{label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: valueColor }}>{value}</Text>
              </RNView>
            ))}
          </RNView>

          {entry.forma.length > 0 && (
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 11, color: statColor }}>Forma</Text>
              <RNView style={{ flexDirection: 'row', gap: 4 }}>
                {entry.forma.map((r, i) => (
                  <FormDot key={i} result={r} />
                ))}
              </RNView>
            </RNView>
          )}

          {entry.proximoConfronto && (
            <RNView
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 7,
              }}>
              <Text style={{ fontSize: 10, color: statColor, width: 60 }}>
                Rd {entry.proximoConfronto.rodada}
              </Text>
              <Text style={{ fontSize: 10, color: statColor }}>
                {entry.proximoConfronto.isMandante ? 'vs' : 'em'}
              </Text>
              <Image
                source={{ uri: entry.proximoConfronto.adversario.url_escudo_png }}
                style={{ width: 22, height: 22, borderRadius: 11 }}
              />
              <Text
                numberOfLines={1}
                style={{ flex: 1, fontSize: 12, fontWeight: '600', color: isDark ? '#e5e7eb' : '#111827' }}>
                {entry.proximoConfronto.adversario.nome}
              </Text>
            </RNView>
          )}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push(`/leagues/club/${entry.time_id}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 10,
              paddingVertical: 9,
              backgroundColor: '#22c55e18',
              borderWidth: 1,
              borderColor: '#22c55e40',
            }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#22c55e' }}>Ver time</Text>
            <Feather name="arrow-right" size={13} color="#22c55e" />
          </TouchableOpacity>
        </RNView>
      )}
    </TouchableOpacity>
  );
}

function TableHeader({ isDark }: { isDark: boolean }) {
  const statColor = isDark ? '#6b7280' : '#9ca3af';
  return (
    <RNView style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, gap: 8 }}>
      <RNView style={{ width: 20 }} />
      <RNView style={{ width: 36 }} />
      <RNView style={{ flex: 1 }} />
      {['PTS', 'V', 'E', 'D'].map((col) => (
        <Text key={col} style={{ width: 28, fontSize: 10, fontWeight: '700', color: statColor, textAlign: 'center' }}>
          {col}
        </Text>
      ))}
      <RNView style={{ width: 18 }} />
    </RNView>
  );
}

export default function () {
  const colorTheme = useThemeColor();
  const { isAutheticated } = useContext(AuthContext);
  const { allowRequest } = useMarketStatus();
  const params = useLocalSearchParams();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const slug = useMemo(() => {
    const raw = params.slug;
    return typeof raw === 'string' ? raw : '';
  }, [params.slug]);

  const { data } = useGetPointsCompetitionBySlug(slug, allowRequest);
  const { data: myClub } = useGetMyClub(!!isAutheticated);

  const standings = useMemo(
    () => computeStandings(data?.participantes ?? {}, data?.confrontos),
    [data?.participantes, data?.confrontos]
  );

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;
  if (!data) return <LoadingScreen title="Carregando liga (Pontos Corridos)" />;

  const isDark = colorTheme === 'dark';
  const bgFull = isDark ? Colors.dark.backgroundFull : Colors.light.backgroundFull;
  const cardBg = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const statColor = isDark ? '#9ca3af' : '#6b7280';

  const isOwner = (myClub?.time?.time_id ?? 0) === data.time_dono_id;
  const myTeamId = myClub?.time?.time_id ?? 0;

  const invited = Object.values(data.convidados ?? {});

  function toggleExpand(id: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <SafeAreaViewContainer edges={['top']}>
      <RNView style={{ flex: 1, backgroundColor: bgFull }}>
        {/* Liga header */}
        <RNView style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: bgFull }}>
          <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor,
              }}>
              <Feather name="chevron-left" size={20} color={isDark ? '#e5e7eb' : '#111827'} />
            </TouchableOpacity>

            <RNView style={{ flex: 1, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '800' }} numberOfLines={1}>
                {data.nome}
              </Text>
              <Text style={{ fontSize: 11, color: statColor }}>
                {data.quantidade_participantes}/{data.quantidade_times} times ·{' '}
                {data.privacidade === 'A' ? 'Aberta' : 'Fechada'}
              </Text>
            </RNView>

            {isOwner && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/leagues/create/invite',
                    params: { type: 'points', slug: data.slug },
                  })
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#22c55e20',
                  borderWidth: 1,
                  borderColor: '#22c55e',
                }}>
                <Feather name="user-plus" size={18} color="#22c55e" />
              </TouchableOpacity>
            )}
          </RNView>
        </RNView>

        <FlatList
          data={standings}
          keyExtractor={(item) => `${item.time_id}`}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
          ListHeaderComponent={
            <>
              <Text style={{ fontSize: 13, fontWeight: '700', color: statColor, marginBottom: 2, marginTop: 4 }}>
                Classificação
              </Text>
              <TableHeader isDark={isDark} />
            </>
          }
          ItemSeparatorComponent={() => <RNView style={{ height: 6 }} />}
          renderItem={({ item, index }) => (
            <StandingRow
              entry={item}
              rank={index + 1}
              isExpanded={expandedId === item.time_id}
              isMyTeam={item.time_id === myTeamId}
              onToggle={() => toggleExpand(item.time_id)}
              isDark={isDark}
            />
          )}
          ListFooterComponent={
            invited.length > 0 ? (
              <RNView style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: statColor, marginBottom: 8 }}>
                  Convidados ({invited.length})
                </Text>
                {invited.map((team) => (
                  <TouchableOpacity
                    key={team.time_id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/leagues/club/${team.time_id}`)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 10,
                      borderRadius: 10,
                      backgroundColor: cardBg,
                      borderWidth: 1,
                      borderColor,
                      marginBottom: 6,
                    }}>
                    <Image source={{ uri: team.url_escudo_png }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                    <RNView style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                        {team.nome}
                      </Text>
                      <Text style={{ fontSize: 11, color: statColor }} numberOfLines={1}>
                        {team.nome_cartola}
                      </Text>
                    </RNView>
                    {team.assinante && (
                      <RNView style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, backgroundColor: '#fbbf2420' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#f59e0b' }}>PRO</Text>
                      </RNView>
                    )}
                  </TouchableOpacity>
                ))}
              </RNView>
            ) : null
          }
        />
      </RNView>
    </SafeAreaViewContainer>
  );
}
