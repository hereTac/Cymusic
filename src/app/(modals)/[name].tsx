import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Redirect } from 'expo-router';
import { PlaylistTracksList } from '@/components/PlaylistTracksList';
import { screenPadding } from '@/constants/tokens';
import { usePlaylists } from '@/store/library';
import { defaultStyles } from '@/styles';
import { getSingerDetail, getTopListDetail } from '@/helpers/userApi/getMusicSource'
import { Track } from 'react-native-track-player';
import { SingerTracksList } from '@/components/SingerTracksList'
import { log } from 'expo/build/devtools/logger'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const SingerListScreen = () => {
    const { name: playlistName } = useLocalSearchParams<{ name: string }>();
    const { playlists } = usePlaylists();
   const playlist = playlists.find((playlist) => playlist.title === playlistName);
    const [singerListDetail, setSingerListDetail] = useState<{ musicList: Track[] } | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchSingerListDetail = async () => {
            // console.log(playlistName+'123123')
          const detail =await getSingerDetail(playlistName);
          // console.log(JSON.stringify(detail.musicList));
            setSingerListDetail(detail);


            setLoading(false);
        };
        fetchSingerListDetail();
    }, []);

    if (loading) {
        return (
            <View style={defaultStyles.container}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }
const DismissPlayerSymbol = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        top: top-28,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <View
        accessible={false}
        style={{
          width: 65,
          height: 8,
          borderRadius: 8,
          backgroundColor: '#fff',
          opacity: 0.7,
        }}
      />
    </View>
  );
};

    return (
        <SafeAreaView style={defaultStyles.container}>
          <DismissPlayerSymbol />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ paddingHorizontal: screenPadding.horizontal }}
            >
                <SingerTracksList playlist={singerListDetail} tracks={singerListDetail.musicList} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default SingerListScreen;
