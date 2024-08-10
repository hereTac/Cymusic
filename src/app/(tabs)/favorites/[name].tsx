import { PlaylistTracksList } from '@/components/PlaylistTracksList'
import { screenPadding } from '@/constants/tokens'
import { usePlaylists } from '@/store/library'
import { defaultStyles } from '@/styles'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { ScrollView, View } from 'react-native'
import myTrackPlayer from '@/helpers/trackPlayerIndex'
import { Track } from 'react-native-track-player';
import { Playlist } from '@/helpers/types'
const PlaylistScreen = () => {
	const { name: playlistID } = useLocalSearchParams<{ name: string }>()

	const { playlists } = usePlaylists()

	const playlistResult = myTrackPlayer.getPlayListById(playlistID)

if (!playlistResult || playlistResult.length === 0){
		console.warn(`Playlist ${playlistID} was not found!`)

		return <Redirect href={'/(tabs)/favorites'} />
	}
const playlist = Array.isArray(playlistResult) ? playlistResult : [playlistResult]
const songs = playlist.flatMap(item => item.songs)
	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{ paddingHorizontal: screenPadding.horizontal }}
			>
				<PlaylistTracksList playlist={playlistResult[0] as unknown as Playlist}  tracks={songs as Track[]}/>
			</ScrollView>
		</View>
	)
}

export default PlaylistScreen