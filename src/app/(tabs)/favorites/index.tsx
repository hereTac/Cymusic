import { TracksList } from '@/components/TracksList'
import { screenPadding } from '@/constants/tokens'
import { trackTitleFilter } from '@/helpers/filter'
import { generateTracksListId } from '@/helpers/miscellaneous'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useFavorites } from '@/store/library'
import { defaultStyles } from '@/styles'
import { useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { Track } from 'react-native-track-player'
import { PlaylistsList } from '@/components/PlaylistsList'
import { Playlist } from '@/helpers/types'
import { router } from 'expo-router'
import myTrackPlayer, { playListsStore } from '@/helpers/trackPlayerIndex'

const FavoritesScreen = () => {
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find in favorites',
		},
	})

	const { favorites } = useFavorites()

	const favoritePlayListItem ={
	name: 'Favorites',
	id:'favorites',
	tracks: [],
	title:'喜欢的歌曲',
	coverImg:'https://y.qq.com/mediastyle/global/img/cover_like.png?max_age=2592000',
	description:'喜欢的歌曲'
}
const storedPlayLists =playListsStore.useValue() || [];
	const playLists = [favoritePlayListItem,...storedPlayLists]

	const filteredPlayLists = useMemo(() => {
		if (!search) return playLists as Playlist[]

		return playLists.filter((playlist: Playlist) =>
	playlist.name.toLowerCase().includes(search.toLowerCase())) as  Playlist[]
	}, [search, playLists,storedPlayLists])
const handlePlaylistPress = (playlist: Playlist) => {
		if(playlist.name =='Favorites'){
			router.push(`/(tabs)/favorites/favoriteMusic`)
		}
		else {
				router.push(`/(tabs)/favorites/${playlist.id}`)
		}

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
					playlists={filteredPlayLists as Playlist[]}
					onPlaylistPress={handlePlaylistPress}
				/>
			</ScrollView>
		</View>
	)
}

export default FavoritesScreen
