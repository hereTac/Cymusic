// helpers/searchAll.ts

import { searchMusic } from '@/helpers/userApi/xiaoqiu'
import { Track } from 'react-native-track-player'

const PAGE_SIZE = 20

const searchAll = async (
	searchText: string,
	page: number = 1,
): Promise<{ data: Track[]; hasMore: boolean }> => {
	console.log('search text+++', searchText, 'page:', page)
	const result = await searchMusic(searchText, page, PAGE_SIZE)

	// console.log(result.data)

	const hasMore = result.data.length === PAGE_SIZE

	return {
		data: result.data as Track[],
		hasMore,
	}
}

export default searchAll
