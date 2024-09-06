import { PlaylistTracksList } from '@/components/PlaylistTracksList'
import { screenPadding } from '@/constants/tokens'
import { Playlist } from '@/helpers/types'
import { useFavorites } from '@/store/library'
import { defaultStyles } from '@/styles'
import React, { useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { Track } from 'react-native-track-player'

const FavoriteMusicScreen = () => {
	// const search = useNavigationSearch({
	// 	searchBarOptions: {
	// 		placeholder: 'Find in favorites',
	// 	},
	// })

	const { favorites } = useFavorites()
	const playListItem = {
		name: 'Favorites',
		id: 'favorites',
		tracks: [],
		title: '喜欢的歌曲',
		coverImg: 'https://y.qq.com/mediastyle/global/img/cover_like.png?max_age=2592000',
		description: '喜欢的歌曲',
	}
	const playLists = [playListItem]
	const filteredFavoritesTracks = useMemo(() => {
		// if (!search) return favorites as Track[]

		return favorites as Track[]
	}, [favorites])

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{ paddingHorizontal: screenPadding.horizontal }}
			>
				<PlaylistTracksList playlist={playListItem as Playlist} tracks={filteredFavoritesTracks} />
			</ScrollView>
		</View>
	)
}
export default FavoriteMusicScreen
