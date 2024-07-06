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

const FavoritesScreen = () => {
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find in favorites',
		},
	})

	const { favorites } = useFavorites()

	const filteredFavoritesTracks = useMemo(() => {
		if (!search) return favorites as Track[]

		return favorites.filter(trackTitleFilter(search)) as  Track[]
	}, [search, favorites])

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				style={{ paddingHorizontal: screenPadding.horizontal }}
				contentInsetAdjustmentBehavior="automatic"
			>
				<TracksList
					id={generateTracksListId('favorites', search)}
					scrollEnabled={false}
					tracks={filteredFavoritesTracks}
				/>
			</ScrollView>
		</View>
	)
}

export default FavoritesScreen
