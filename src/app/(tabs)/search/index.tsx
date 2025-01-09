import { SearchList } from '@/components/SearchList'
import { colors } from '@/constants/tokens'
import searchAll from '@/helpers/searchAll'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles } from '@/styles'
import i18n from '@/utils/i18n'
import { useRouter } from 'expo-router'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { Track } from 'react-native-track-player'

type SearchType = 'songs' | 'artists'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SEGMENT_WIDTH = (SCREEN_WIDTH - 32 - 4) / 2 // 32 for padding, 4 for container padding

const SearchlistsScreen = () => {
	const router = useRouter()
	const [searchResults, setSearchResults] = useState<Track[]>([])
	const [page, setPage] = useState(1)
	const [isLoading, setIsLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const searchRequestRef = useRef(0)
	const [searchType, setSearchType] = useState<SearchType>('songs')
	const slideAnim = useRef(new Animated.Value(0)).current

	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: i18n.t('find.inSearch'),
			cancelButtonText: i18n.t('find.cancel'),
		},
	})

	const fetchSearchResults = useCallback(
		async (currentPage: number) => {
			if (!search) {
				return
			}

			const requestId = ++searchRequestRef.current
			setIsLoading(true)

			try {
				const { data, hasMore: moreResults } = await searchAll(search, currentPage, searchType)

				if (requestId === searchRequestRef.current) {
					setHasMore(moreResults)
					setSearchResults((prevResults) => {
						const newResults = currentPage === 1 ? data : [...prevResults, ...data]

						return newResults
					})

					setPage(currentPage)
				} else {
					console.log('Skipping state update due to outdated request')
				}
			} catch (error) {
				console.error('Error fetching search results:', error)
			} finally {
				if (requestId === searchRequestRef.current) {
					setIsLoading(false)
				}
			}
		},
		[search, searchType],
	)
	const debouncedFetchSearchResults = useRef(
		debounce((currentPage: number) => {
			fetchSearchResults(currentPage)
		}, 300),
	).current

	useEffect(() => {
		debouncedFetchSearchResults.cancel()
	}, [search])
	useEffect(() => {}, [searchResults])
	useEffect(() => {
		setPage(1)
		setHasMore(true)
		setSearchResults([])
		searchRequestRef.current++

		if (search === '') {
			setIsLoading(false)
			setHasMore(false)
			setSearchResults([])
		} else if (search) {
			fetchSearchResults(1)
		}

		return () => {
			searchRequestRef.current++
		}
	}, [search, searchType, fetchSearchResults])

	const handleLoadMore = useCallback(() => {
		if (!isLoading && hasMore && search) {
			fetchSearchResults(page + 1)
		}
	}, [isLoading, hasMore, page, fetchSearchResults, search])

	const handleSearchTypeChange = (type: SearchType) => {
		const toValue = type === 'songs' ? 0 : SEGMENT_WIDTH
		Animated.spring(slideAnim, {
			toValue,
			useNativeDriver: true,
			tension: 100,
			friction: 10,
		}).start()
		setSearchType(type)
	}

	return (
		<SafeAreaView style={defaultStyles.container}>
			<View style={styles.segmentedControlContainer}>
				<View style={styles.segmentedControl}>
					<Animated.View
						style={[
							styles.activeSegment,
							{
								position: 'absolute',
								width: SEGMENT_WIDTH,
								transform: [{ translateX: slideAnim }],
							},
						]}
					/>
					<Pressable
						style={[styles.segment, { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]}
						onPress={() => handleSearchTypeChange('songs')}
					>
						<Text style={[styles.segmentText, searchType === 'songs' && styles.activeSegmentText]}>
							{i18n.t('find.songs')}
						</Text>
					</Pressable>
					<Pressable
						style={[styles.segment, { borderTopRightRadius: 8, borderBottomRightRadius: 8 }]}
						onPress={() => handleSearchTypeChange('artists')}
					>
						<Text
							style={[styles.segmentText, searchType === 'artists' && styles.activeSegmentText]}
						>
							{i18n.t('find.artists')}
						</Text>
					</Pressable>
				</View>
			</View>
			<SearchList
				tracks={searchResults}
				id={'search'}
				onLoadMore={handleLoadMore}
				hasMore={hasMore}
				isLoading={isLoading}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	segmentedControlContainer: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	segmentedControl: {
		flexDirection: 'row',
		backgroundColor: colors.background,
		borderRadius: 8,
		padding: 2,
		position: 'relative',
	},
	segment: {
		flex: 1,
		paddingVertical: 6,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1,
	},
	activeSegment: {
		backgroundColor: '#252525',
		borderRadius: 6,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.15,
		shadowRadius: 2,
		elevation: 2,
		position: 'absolute',
		top: 2,
		bottom: 2,
		zIndex: 0,
	},
	segmentText: {
		fontSize: 15,
		color: '#666',
	},
	activeSegmentText: {
		color: colors.primary,
		fontWeight: '500',
	},
})

export default SearchlistsScreen
