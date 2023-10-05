import { Feather } from '@expo/vector-icons';
import { Link, Redirect, useLocalSearchParams } from 'expo-router';
import { useContext } from 'react';
import { Image, Pressable, useColorScheme } from 'react-native';

import captainIcon from '@/assets/images/letter-c.png';
import { Text, View } from '@/components/Themed';
import { Cup } from '@/components/contexts/leagues/Cup';
import { League as LeagueComponent } from '@/components/contexts/leagues/League';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import { AuthContext } from '@/contexts/Auth.context';
import useLeague from '@/hooks/useLeague';
import { League } from '@/models/Leagues';
import theme from '@/styles/theme';
import { ClubsByLeagueUtils } from '@/utils/partials';

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  // const [modalVisible, setModalVisible] = useState(false);

  const { id: slug } = useLocalSearchParams();

  // const { league, clubsByLeague, isLoadingLeague, onRefetchLeague } = useLeague({
  //   slug: slug as string,
  // });

  const { league, clubsByLeague, isLoadingLeague } = useLeague({
    slug: slug as string,
  });

  // const onRefetch = useCallback(async () => {
  //   await onRefetchLeague();
  // }, [onRefetchLeague]);

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  if (isLoadingLeague) return <Loading />;

  return (
    <>
      <View
        className={`${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'} pb-2 flex-row px-2`}
        style={{
          gap: 4,
        }}>
        <View className="flex-1 flex-row justify-between items-center py-2 px-4 rounded-lg">
          <View className="flex-row justify-center items-center">
            <Image
              source={{
                uri: league?.liga.mata_mata
                  ? league.liga.url_trofeu_png
                  : league?.liga.url_flamula_png,
              }}
              style={{
                width: theme.Tokens.SIZE.sm,
                height: theme.Tokens.SIZE.sm,
              }}
              alt={`Imagem da liga ${league?.liga.nome}`}
            />
            <Text
              style={{
                fontWeight: '700',
                fontSize: theme.Tokens.TEXT.xs,
                textTransform: 'uppercase',
              }}>
              {league?.liga.nome}
            </Text>
            {!league?.liga.sem_capitao && (
              <Image
                source={captainIcon}
                style={{
                  width: 24,
                  height: 24,
                  margin: 4,
                }}
                alt="Liga com Capitão"
              />
            )}
          </View>
          {/* <TouchableOpacity
            onPress={onRefetch}
            activeOpacity={0.6}
            className="p-3 rounded-full"
            style={{
              backgroundColor: colorTheme === 'dark' ? '#1e40af' : '#3b82f6',
              borderColor: colorTheme === 'dark' ? '#1e3a8a' : '#60a5fa',
              borderWidth: 1,
            }}>
            <Feather name="refresh-ccw" size={14} color="white" />
          </TouchableOpacity> */}
        </View>

        {league?.pedidos && league.pedidos?.length > 0 && (
          <Link
            asChild
            href={
              {
                pathname: '/leagues/league/requests/[id]',
                params: {
                  id: slug as string,
                },
              } as never
            }>
            <Pressable
              className="flex-row justify-center items-center p-2 rounded-lg border-2 border-blue-500"
              style={{
                backgroundColor:
                  colorTheme === 'dark' ? Colors.dark.background : Colors.light.background,
              }}>
              {({ pressed }) => (
                <View
                  className="flex-row items-center justify-center"
                  style={{
                    gap: 4,
                  }}>
                  <View className="w-6 h-6 bg-violet-600 items-center justify-center rounded-full">
                    <Text className="text-neutral-100 font-semibold text-xs">
                      {league.pedidos?.length}
                    </Text>
                  </View>

                  <Feather
                    name="mail"
                    size={16}
                    color={colorTheme === 'dark' ? Colors.dark.text : Colors.light.text}
                    style={{ opacity: pressed ? 0.6 : 1 }}
                  />
                </View>
              )}
            </Pressable>
          </Link>
        )}

        {/* <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.6}
          className="flex-row justify-center items-center py-2 px-4 rounded-lg mt-2">
          <Feather name="menu" size={20} color={GRAY_OPACITY} />
        </TouchableOpacity> */}
      </View>

      {league?.liga.mata_mata ? (
        <Cup league={league} />
      ) : (
        <LeagueComponent
          clubsByLeague={clubsByLeague as ClubsByLeagueUtils}
          league={league as League}
        />
      )}

      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <TouchableOpacity activeOpacity={0.6} className='' onPress={() => setModalVisible(!modalVisible)}>
            <Text>Sair da Liga</Text>
          </TouchableOpacity>
        </View>
      </Modal> */}
    </>
  );
};

// const styles = StyleSheet.create({
//   centeredView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 22,
//   },
//   modalView: {
//     margin: 20,
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 35,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   button: {
//     borderRadius: 20,
//     padding: 10,
//     elevation: 2,
//   },
//   buttonOpen: {
//     backgroundColor: '#F194FF',
//   },
//   buttonClose: {
//     backgroundColor: '#2196F3',
//   },
//   modalText: {
//     marginBottom: 15,
//     textAlign: 'center',
//   },
// });
