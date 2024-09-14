import localImage from '@/assets/local.png'
import { PlaylistsList } from '@/components/PlaylistsList'
import { screenPadding } from '@/constants/tokens'
import { playListsStore } from '@/helpers/trackPlayerIndex'
import { Playlist } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles } from '@/styles'
import { router } from 'expo-router'
import { useMemo } from 'react'
import { Image, ScrollView, View } from 'react-native'

const FavoritesScreen = () => {
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find in favorites',
		},
	})

	const favoritePlayListItem = {
		name: 'Favorites',
		id: 'favorites',
		tracks: [],
		title: '喜欢的歌曲',
		coverImg: 'https://y.qq.com/mediastyle/global/img/cover_like.png?max_age=2592000',
		description: '喜欢的歌曲',
	}

	const localPlayListItem = {
		name: 'Local',
		id: 'local',
		tracks: [],
		title: '本地的歌曲',
		coverImg: Image.resolveAssetSource(localImage).uri,
		description: '在本地的歌曲',
	}
	const storedPlayLists = playListsStore.useValue() || []
	const playLists = [favoritePlayListItem, localPlayListItem, ...storedPlayLists]

	const filteredPlayLists = useMemo(() => {
		if (!search) return playLists as Playlist[]

		return playLists.filter((playlist: Playlist) =>
			playlist.name.toLowerCase().includes(search.toLowerCase()),
		) as Playlist[]
	}, [search, playLists, storedPlayLists])
	const handlePlaylistPress = (playlist: Playlist) => {
		if (playlist.name == 'Favorites') {
			router.push(`/(tabs)/favorites/favoriteMusic`)
		} else if (playlist.name == 'Local') {
			router.push(`/(tabs)/favorites/localMusic`)
		} else {
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
