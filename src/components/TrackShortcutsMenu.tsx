import { useFavorites } from '@/store/library'
import { useQueue } from '@/store/queue'
import { MenuView } from '@react-native-menu/menu'
import { useFocusEffect, useRouter } from 'expo-router'
import { PropsWithChildren, useState, useCallback } from 'react'
import TrackPlayer, { Track } from 'react-native-track-player'
import { match } from 'ts-pattern'
import myTrackPlayer from '@/helpers/trackPlayerIndex'
import { isInPlayList } from '@/store/playList'
import { TouchableOpacity } from 'react-native'

type TrackShortcutsMenuProps = PropsWithChildren<{ track: Track }>

export const TrackShortcutsMenu = ({ track, children }: TrackShortcutsMenuProps) => {
	const router = useRouter()
	const { favorites, toggleTrackFavorite } = useFavorites()
	const isFavorite = favorites.find((trackItem) => trackItem.id === track?.id)
	const { activeQueueId } = useQueue()

	const [isInPlaylist, setIsInPlaylist] = useState(false)

	const updateIsInPlaylist = useCallback(() => {
		setIsInPlaylist(isInPlayList(track as IMusic.IMusicItem))
	}, [track])

	// Ensure state is updated whenever the component is focused
	useFocusEffect(
		useCallback(() => {
			updateIsInPlaylist()
		}, [updateIsInPlaylist])
	)

	const handlePressAction = async (id: string) => {
		await match(id)
			.with('add-to-favorites', async () => {
				toggleTrackFavorite(track)

				if (activeQueueId?.startsWith('favorites')) {
					//await TrackPlayer.add(track)
				}
			})
			.with('remove-from-favorites', async () => {
				toggleTrackFavorite(track)

				if (activeQueueId?.startsWith('favorites')) {
					// const queue = await TrackPlayer.getQueue()
					// const trackToRemove = queue.findIndex((queueTrack) => queueTrack.url === track.url)
					// await TrackPlayer.remove(trackToRemove)
				}
			})
			.with('add-to-playlist', async () => {
				await myTrackPlayer.add(track as IMusic.IMusicItem)
				updateIsInPlaylist()
			})
			.with('remove-from-playlist', async () => {
				await myTrackPlayer.remove(track as IMusic.IMusicItem)
				updateIsInPlaylist()
			})
			.otherwise(() => console.warn(`Unknown menu action ${id}`))
	}
	return (

			<MenuView
				onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
				actions={[
					{
						id: isInPlaylist ? 'remove-from-playlist' : 'add-to-playlist',
						title: isInPlaylist ? 'Remove from playlist' : 'Add to playlist',
						image: isInPlaylist ? 'minus' : 'plus',
					},
					{
						id: isFavorite ? 'remove-from-favorites' : 'add-to-favorites',
						title: isFavorite ? 'Remove from favorites' : 'Add to favorites',
						image: isFavorite ? 'heart.fill' : 'heart',
					},
				]}
			>
				{children}
			</MenuView>

	)
}
