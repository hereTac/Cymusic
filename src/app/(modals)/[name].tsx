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

const SingerListScreen = () => {
    const { name: playlistName } = useLocalSearchParams<{ name: string }>();
    const { playlists } = usePlaylists();
   const playlist = playlists.find((playlist) => playlist.title === playlistName);
    const [topListDetail, setTopListDetail] = useState<{ musicList: Track[] } | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchTopListDetail = async () => {
            console.log(playlistName+'123123')
          const detail =await getSingerDetail(playlistName);
          console.log(JSON.stringify(detail));
            setTopListDetail(detail);


            setLoading(false);
        };
        fetchTopListDetail();
    }, []);

    if (loading) {
        return (
            <View style={defaultStyles.container}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }


    return (
        <View style={defaultStyles.container}>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ paddingHorizontal: screenPadding.horizontal }}
            >
                <SingerTracksList playlist={topListDetail} tracks={topListDetail.musicList} />
            </ScrollView>
        </View>
    );
};

export default SingerListScreen;
