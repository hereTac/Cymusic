import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Redirect } from 'expo-router';
import { PlaylistTracksList } from '@/components/PlaylistTracksList';
import { screenPadding } from '@/constants/tokens';
import { usePlaylists } from '@/store/library';
import { defaultStyles } from '@/styles';
import { getTopListDetail } from '@/helpers/userApi/getMusicSource';
import { Track } from 'react-native-track-player';

const RadioListScreen = () => {
    const { name: playlistName } = useLocalSearchParams<{ name: string }>();
    const { playlists } = usePlaylists();
    const [topListDetail, setTopListDetail] = useState<{ musicList: Track[] } | null>(null);
    const [loading, setLoading] = useState(true);

    const playlist = playlists.find((playlist) => playlist.title === playlistName);

    useEffect(() => {
        const fetchTopListDetail = async () => {
            if (!playlist) {
                console.warn(`Playlist ${playlistName} was not found!`);
                setLoading(false);
                return;
            }

            const detail = await getTopListDetail(playlist);
            setTopListDetail(detail);
						console.log(JSON.stringify(detail));
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

    if (!playlist || !topListDetail) {
        return <Redirect href={'/(tabs)/radio'} />;
    }

    return (
        <View style={defaultStyles.container}>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ paddingHorizontal: screenPadding.horizontal }}
            >
                <PlaylistTracksList playlist={playlist} tracks={topListDetail.musicList} />
            </ScrollView>
        </View>
    );
};

export default RadioListScreen;
