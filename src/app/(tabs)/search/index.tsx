import { SearchList } from '@/components/SearchList'
import searchAll from '@/helpers/searchAll'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles } from '@/styles'
import i18n from '@/utils/i18n'
import { useRouter } from 'expo-router'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'
import { Track } from 'react-native-track-player'

const SearchlistsScreen = () => {
	const router = useRouter()
	const [searchResults, setSearchResults] = useState<Track[]>([])
	const [page, setPage] = useState(1)
	const [isLoading, setIsLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const searchRequestRef = useRef(0)

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
				const { data, hasMore: moreResults } = await searchAll(search, currentPage)

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
		[search],
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
	}, [search, fetchSearchResults])

	const handleLoadMore = useCallback(() => {
		if (!isLoading && hasMore && search) {
			fetchSearchResults(page + 1)
		}
	}, [isLoading, hasMore, page, fetchSearchResults, search])

	return (
		<SafeAreaView style={defaultStyles.container}>
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

export default SearchlistsScreen
