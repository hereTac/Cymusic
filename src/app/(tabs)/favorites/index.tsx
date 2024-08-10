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

const FavoritesScreen = () => {
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find in favorites',
		},
	})

	const { favorites } = useFavorites()
	const playListItem ={
	name: 'Favorites',
	tracks: [],
	title:'喜欢的歌曲',
	coverImg:'https://y.qq.com/mediastyle/global/img/cover_like.png?max_age=2592000',
	description:'喜欢的歌曲'
}
	const playLists = [playListItem]
	const filteredFavoritesTracks = useMemo(() => {
		if (!search) return favorites as Track[]

		return favorites.filter(trackTitleFilter(search)) as  Track[]
	}, [search, favorites])
const handlePlaylistPress = (playlist: Playlist) => {
		if(playlist.name =='Favorites'){
			router.push(`/(tabs)/favorites/favoriteMusic`)
		}
		else {
				router.push(`/(tabs)/favorites/${playlist.name}`)
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
					playlists={playLists as Playlist[]}
					onPlaylistPress={handlePlaylistPress}
				/>
			</ScrollView>
		</View>
	)
}

export default FavoritesScreen
