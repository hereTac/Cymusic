import { TracksListItem } from '@/components/TracksListItem'
import { unknownTrackImageUri } from '@/constants/images'
import { colors } from '@/constants/tokens'
import myTrackPlayer from '@/helpers/trackPlayerIndex'
import { utilsStyles } from '@/styles'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, FlatListProps, StyleSheet, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Track, useActiveTrack } from 'react-native-track-player'

export type TracksListProps = Partial<FlatListProps<Track>> & {
	id: string
	tracks: Track[]
	hideQueueControls?: boolean
}

const ItemDivider = () => (
	<View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60 }} />
)

const ITEM_HEIGHT = 60 // 假设每个项目的高度为60，根据实际情况调整

export const NowPlayList = ({
	id,
	tracks,
	hideQueueControls = false,
	...flatlistProps
}: TracksListProps) => {
	const flatListRef = useRef<FlatList<Track>>(null)
	const activeTrack = useActiveTrack()
	const [initialIndex, setInitialIndex] = useState<number | null>(null)
	const { top } = useSafeAreaInsets()
	const getItemLayout = useCallback(
		(data: any, index: number) => ({
			length: ITEM_HEIGHT,
			offset: ITEM_HEIGHT * index,
			index,
		}),
		[],
	)

	useEffect(() => {
		if (activeTrack) {
			const index = tracks.findIndex((track) => track.id === activeTrack.id)
			if (index !== -1) {
				setInitialIndex(index)
			}
		}
	}, [activeTrack, tracks])

	const handleTrackSelect = useCallback(async (selectedTrack: Track) => {
		await myTrackPlayer.play(selectedTrack as IMusic.IMusicItem)
	}, [])

	const handleScrollToIndexFailed = useCallback(
		(info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
			const wait = new Promise((resolve) => setTimeout(resolve, 100))
			wait.then(() => {
				flatListRef.current?.scrollToIndex({
					index: info.index,
					animated: false,
					viewPosition: 0.5,
				})
			})
		},
		[],
	)

	const DismissPlayerSymbol = useCallback(() => {
		return (
			<View
				style={{
					position: 'absolute',
					top: top - 28,
					left: 0,
					right: 0,
					flexDirection: 'row',
					justifyContent: 'center',
				}}
			>
				<View
					accessible={false}
					style={{
						width: 50,
						height: 8,
						borderRadius: 8,
						backgroundColor: '#fff',
						opacity: 0.7,
					}}
				/>
			</View>
		)
	}, [])

	const renderItem = useCallback(
		({ item: track }: { item: Track }) => (
			<TracksListItem track={track} onTrackSelect={handleTrackSelect} />
		),
		[handleTrackSelect],
	)

	const keyExtractor = useCallback((item: Track) => item.id, [])

	const initialNumToRender = useMemo(() => {
		if (initialIndex !== null) {
			return Math.max(20, initialIndex + 10) // 确保至少渲染20个项目或当前项目上方10个项目
		}
		return 20
	}, [initialIndex])

	return (
		<>
			<DismissPlayerSymbol />
			<Text style={styles.header}>播放列表</Text>
			{initialIndex == null ? (
				<></>
			) : (
				<FlatList
					data={tracks}
					contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
					ListFooterComponent={ItemDivider}
					ItemSeparatorComponent={ItemDivider}
					ref={flatListRef}
					getItemLayout={getItemLayout}
					initialScrollIndex={initialIndex}
					ListEmptyComponent={
						<View>
							<Text style={utilsStyles.emptyContentText}>No songs </Text>
							<FastImage
								source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
								style={utilsStyles.emptyContentImage}
							/>
						</View>
					}
					onScrollToIndexFailed={handleScrollToIndexFailed}
					renderItem={renderItem}
					keyExtractor={keyExtractor}
					initialNumToRender={initialNumToRender}
					maxToRenderPerBatch={10}
					windowSize={21}
					removeClippedSubviews={false}
					updateCellsBatchingPeriod={50}
					maintainVisibleContentPosition={{
						minIndexForVisible: 0,
						autoscrollToTopThreshold: 10,
					}}
					{...flatlistProps}
				/>
			)}
		</>
	)
}

const styles = StyleSheet.create({
	headerContainer: {
		paddingTop: 20,
		paddingBottom: 10,
	},
	lineContainer: {
		position: 'absolute',
		top: -20,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 10,
	},
	line: {
		width: 50,
		height: 8,
		borderRadius: 8,
		backgroundColor: '#fff',
		opacity: 0.7,
	},
	header: {
		fontSize: 28,
		fontWeight: 'bold',
		padding: 0,
		paddingBottom: 20,
		marginTop: -5,
		color: colors.text,
	},
})
