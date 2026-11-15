import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeTabs } from 'expo-router/native-tabs';
import { Platform } from 'react-native';

import { useTabBadges } from '@/hooks/useTabBadges';
import { useTokens } from '@/hooks/useTokens';

const { Trigger } = NativeTabs;
const { Icon, Label, Badge, VectorIcon } = Trigger;

/**
 * iOS: o espaço da barra de abas é aplicado em cada scroll por useTabBarSpacing,
 * então o ajuste automático do sistema fica desligado para não somar duas vezes.
 * Android: mantém o comportamento padrão (área segura inferior aplicada pelas abas).
 */
const manualInsets = Platform.OS === 'ios';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Android: contorno quando inativo, preenchido quando ativo (Material 3). */
function androidIcon(outline: IconName, filled: IconName) {
  return {
    default: <VectorIcon family={MaterialCommunityIcons} name={outline} />,
    selected: <VectorIcon family={MaterialCommunityIcons} name={filled} />,
  };
}

/**
 * Barra de abas nativa.
 * iOS 26+: o sistema desenha o material (Liquid Glass) e respeita a preferência de
 * transparência do usuário; por isso não definimos fundo nem blur aqui.
 * Android: NavigationBar do Material 3 com indicador em pill e rótulos sempre visíveis.
 */
export default function TabLayout() {
  const { colors } = useTokens();
  const { hasUnsavedLineup, invitesCount, isBallRolling } = useTabBadges();

  return (
    <NativeTabs
      tintColor={colors.brandText}
      // Sempre visível: não retrai ao rolar (iOS 26+)
      minimizeBehavior="never"
      badgeBackgroundColor={colors.negativeFill}
      badgeTextColor={colors.onNegativeFill}
      // Só Android: no iOS 26+ o fundo é do sistema e estas props não têm efeito.
      backgroundColor={Platform.OS === 'android' ? colors.surface : undefined}
      indicatorColor={colors.brandContainer}
      rippleColor={colors.brandContainer}
      labelVisibilityMode="labeled"
      iconColor={
        Platform.OS === 'android' ? { default: colors.textMuted, selected: colors.text } : undefined
      }
      labelStyle={
        Platform.OS === 'android'
          ? { default: { color: colors.textMuted }, selected: { color: colors.text } }
          : undefined
      }>
      <Trigger name="index" disableAutomaticContentInsets={manualInsets}>
        <Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          src={androidIcon('home-outline', 'home')}
        />
        <Label>Início</Label>
      </Trigger>

      <Trigger name="team" disableAutomaticContentInsets={manualInsets}>
        <Icon
          sf={{ default: 'shield', selected: 'shield.fill' }}
          src={androidIcon('shield-outline', 'shield')}
        />
        <Label>Time</Label>
        {/* Alterações na escalação ainda não salvas */}
        {hasUnsavedLineup ? <Badge>1</Badge> : null}
      </Trigger>

      <Trigger name="rodada" disableAutomaticContentInsets={manualInsets}>
        <Icon
          sf={{ default: 'bolt', selected: 'bolt.fill' }}
          src={androidIcon('lightning-bolt-outline', 'lightning-bolt')}
        />
        <Label>Rodada</Label>
        {isBallRolling ? <Badge>{Platform.OS === 'ios' ? 'AO VIVO' : '•'}</Badge> : null}
      </Trigger>

      <Trigger name="leagues" disableAutomaticContentInsets={manualInsets}>
        <Icon
          sf={{ default: 'trophy', selected: 'trophy.fill' }}
          src={androidIcon('trophy-outline', 'trophy')}
        />
        <Label>Ligas</Label>
        {invitesCount > 0 ? <Badge>{String(invitesCount)}</Badge> : null}
      </Trigger>

      <Trigger name="profile/index" disableAutomaticContentInsets={manualInsets}>
        <Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          src={androidIcon('account-outline', 'account')}
        />
        <Label>Perfil</Label>
      </Trigger>
    </NativeTabs>
  );
}
