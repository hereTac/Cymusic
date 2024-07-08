import { useFavorites } from '@/store/library'
import { useQueue } from '@/store/queue'
import { MenuView } from '@react-native-menu/menu'
import { useRouter } from 'expo-router'
import { PropsWithChildren } from 'react'
import TrackPlayer, { Track } from 'react-native-track-player'
import { match } from 'ts-pattern'

type TrackShortcutsMenuProps = PropsWithChildren<{ track: Track }>

export const TrackShortcutsMenu = ({ track, children }: TrackShortcutsMenuProps) => {
	const router = useRouter()
	const { favorites,toggleTrackFavorite } = useFavorites()
	const isFavorite = favorites.find((trackItem) => trackItem.id === track?.id)
	const { activeQueueId } = useQueue()

	const handlePressAction = (id: string) => {
		match(id)
			.with('add-to-favorites', async () => {

				toggleTrackFavorite(track)

				// if the tracks is in the favorite queue, add it
				if (activeQueueId?.startsWith('favorites')) {
					//await TrackPlayer.add(track)
				}
			})
			.with('remove-from-favorites', async () => {
				toggleTrackFavorite(track)

				// if the track is in the favorites queue, we need to remove it
				if (activeQueueId?.startsWith('favorites')) {
					// const queue = await TrackPlayer.getQueue()
					//
					// const trackToRemove = queue.findIndex((queueTrack) => queueTrack.url === track.url)
					//
					// await TrackPlayer.remove(trackToRemove)
				}
			})
			.with('add-to-playlist', () => {
				// it opens the addToPlaylist modal
				//下一首播放？加入播放列表
				// router.push({ pathname: '(modals)/addToPlaylist', params: { trackUrl: track.url } })
			})
			.otherwise(() => console.warn(`Unknown menu action ${id}`))
	}

	return (
		<MenuView
			onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
			actions={[
					{
					id: 'add-to-playlist',
					title: 'Add to playlist',
					image: 'plus',
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
