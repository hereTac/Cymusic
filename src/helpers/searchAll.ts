// helpers/searchAll.ts


import { searchMusic } from '@/helpers/userApi/xiaoqiu'
import { Track } from 'react-native-track-player'

const searchAll = async (searchText: string) => {
	console.log('search text+++', searchText)
		const result =await searchMusic(searchText, 1)

	console.log(result.data)


	return result.data as Track[]
}

export default searchAll
