import { SearchList } from '@/components/SearchList'
import { screenPadding } from '@/constants/tokens'
import searchAll from '@/helpers/searchAll'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles } from '@/styles'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Track } from 'react-native-track-player'

const SearchlistsScreen = () => {
	const router = useRouter()
	const [searchResults, setSearchResults] = useState<Track[]>([])

	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find Something',
		},
	})

	useEffect(() => {
		const fetchSearchResults = async () => {
			const results = await searchAll(search)
			setSearchResults(results)
		}
		fetchSearchResults()
	}, [search])

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{
					paddingHorizontal: screenPadding.horizontal,
				}}
			>
				<SearchList scrollEnabled={false} tracks={searchResults} id={'search'} />
			</ScrollView>
		</View>
	)
}

export default SearchlistsScreen
