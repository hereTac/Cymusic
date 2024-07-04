import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player'
import { useLibraryStore } from '@/store/library'

const events = [Event.PlaybackState, Event.PlaybackError, Event.PlaybackQueueEnded, Event.PlaybackActiveTrackChanged, Event.PlaybackPlayWhenReadyChanged]

export const useLogTrackPlayerState = () => {
	useTrackPlayerEvents(events, async (event) => {
		if (event.type === Event.PlaybackError) {
			console.warn('An error occurred: ', event)
		}

		if (event.type === Event.PlaybackState) {
			console.log('Playback state: ', event.state)
		}
   else if (event.type === Event.PlaybackQueueEnded) {
			console.log(' PlaybackQueueEnded: ', event.track)
		}

		else if (event.type === Event.PlaybackActiveTrackChanged) {

			console.log('Track changed:', event.index)

		}
		else {
				console.log('Track other type:', event.type)
		}

	})
}
