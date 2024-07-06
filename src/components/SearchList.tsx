import { TracksListItem } from '@/components/TracksListItem'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { useRef } from 'react'
import { FlatList, FlatListProps, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import TrackPlayer, { Track } from 'react-native-track-player'
import { QueueControls } from './QueueControls'

import api_ikun from '@/components/utils/musicSdk/tx/api-ikun'
import myTrackPlayer from '@/helpers/trackPlayerIndex'
import { myGetMusicUrl } from '@/helpers/userApi/getMusicSource'
import { setPlayList } from '@/store/playList'




export type TracksListProps = Partial<FlatListProps<Track>> & {
	//以及所有来自 FlatListProps 的属性，且这些属性都是可选的。
	id: string
	tracks: Track[]
	hideQueueControls?: boolean
}

const ItemDivider = () => (
	<View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60 }} />
)
export const SearchList = ({
	id,
	tracks,
	hideQueueControls = false,
	...flatlistProps
}: TracksListProps) => {
	const { activeQueueId, setActiveQueueId } = useQueue()

	const handleTrackSelect = async (selectedTrack: Track) => {

	if(selectedTrack.url=='Unknown') {
	const res = await myGetMusicUrl(selectedTrack, '128k')
	selectedTrack.url = res.url
	}
		setPlayList([selectedTrack] as unknown as IMusic.IMusicItem[])
		await TrackPlayer.load(selectedTrack)
		TrackPlayer.play()
	}

	return (
		<FlatList
			data={tracks}
			contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}

			ListFooterComponent={ItemDivider}
			ItemSeparatorComponent={ItemDivider}
			ListEmptyComponent={
				<View>
					<Text style={utilsStyles.emptyContentText}>Search for songs</Text>

					<FastImage
						source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
						style={utilsStyles.emptyContentImage}
					/>
				</View>
			}
			renderItem={({ item: track }) => (
				<TracksListItem track={track} onTrackSelect={handleTrackSelect} /> //将 track 和 handleTrackSelect 作为 props 传递给它。
			)}
			{...flatlistProps}
		/>
	)
}
