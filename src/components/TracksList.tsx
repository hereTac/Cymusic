import { TracksListItem } from '@/components/TracksListItem'
import { unknownTrackImageUri } from '@/constants/images'
import myTrackPlayer from '@/helpers/trackPlayerIndex'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { useRef } from 'react'
import { FlatList, FlatListProps, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { Track } from 'react-native-track-player'
import { QueueControls } from './QueueControls'
export type TracksListProps = Partial<FlatListProps<Track>> & {
	//以及所有来自 FlatListProps 的属性，且这些属性都是可选的。
	id: string
	tracks: Track[]
	hideQueueControls?: boolean
	isSinger?: boolean
	allowDelete?: boolean
	onDeleteTrack?: (trackId: string) => void
	isMultiSelectMode?: boolean
	selectedTracks?: Set<string>
	onToggleSelection?: (trackId: string) => void
	toggleMultiSelectMode?: () => void
}

const ItemDivider = () => (
	<View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60 }} />
)
export const TracksList = ({
	id,
	tracks,
	hideQueueControls = false,
	isSinger = false,
	allowDelete = false,
	isMultiSelectMode = false,
	onDeleteTrack,
	selectedTracks = new Set(),
	onToggleSelection,
	toggleMultiSelectMode,
	...flatlistProps
}: TracksListProps) => {
	const queueOffset = useRef(0)
	const { activeQueueId, setActiveQueueId } = useQueue()

	const handleTrackSelect = async (selectedTrack: Track) => {
		const isChangingQueue = id !== activeQueueId
		//
		if (isChangingQueue) {
			await myTrackPlayer.playWithReplacePlayList(
				selectedTrack as IMusic.IMusicItem,
				tracks as IMusic.IMusicItem[],
			)

			setActiveQueueId(id)
		} else {
			await myTrackPlayer.playWithReplacePlayList(
				selectedTrack as IMusic.IMusicItem,
				tracks as IMusic.IMusicItem[],
			)
		}
	}

	return (
		<FlatList
			data={tracks}
			contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
			ListHeaderComponent={
				!hideQueueControls ? (
					<QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
				) : undefined
			}
			ListFooterComponent={ItemDivider}
			ItemSeparatorComponent={ItemDivider}
			ListEmptyComponent={
				<View>
					<Text style={utilsStyles.emptyContentText}>No songs found</Text>

					<FastImage
						source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
						style={utilsStyles.emptyContentImage}
					/>
				</View>
			}
			renderItem={({ item: track }) => (
				<TracksListItem
					track={track}
					onTrackSelect={handleTrackSelect}
					isSinger={isSinger}
					allowDelete={allowDelete}
					onDeleteTrack={onDeleteTrack}
					isMultiSelectMode={isMultiSelectMode}
					onToggleSelection={onToggleSelection}
					selectedTracks={selectedTracks}
					toggleMultiSelectMode={toggleMultiSelectMode}
				/> //将 track 和 handleTrackSelect 作为 props 传递给它。
			)}
			{...flatlistProps}
		/>
	)
}
