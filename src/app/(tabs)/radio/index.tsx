import { PlaylistsList } from '@/components/PlaylistsList'
import { screenPadding } from '@/constants/tokens'
import { playlistNameFilter } from '@/helpers/filter'
import { Playlist } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { usePlaylists } from '@/store/library'
import { defaultStyles } from '@/styles'
import { useRouter } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { getTopListDetail, getTopLists } from '@/helpers/userApi/getMusicSource'

const RadiolistsScreen = () => {
	const router = useRouter()

	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find in Radio',
		},
	})
//   const a =useEffect(()=>{
// getTopLists()
//     .then(a => {
//         console.log(a);
// 				setPlayList(a);
//     })
//     .catch(error => {
//         console.error('Error fetching top lists:', error);
//     });
// 	})
	const { playlists,setPlayList } = usePlaylists()


	const handlePlaylistPress = (playlist: Playlist) => {
		router.push(`/(tabs)/radio/${playlist.title}`)
	}

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{
					paddingHorizontal: screenPadding.horizontal,
				}}
			>
				<PlaylistsList
					scrollEnabled={false}
					playlists={playlists}
					onPlaylistPress={handlePlaylistPress}
				/>
			</ScrollView>
		</View>
	)
}

export default RadiolistsScreen
