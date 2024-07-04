import { colors } from '@/constants/tokens'
import { FontAwesome6 } from '@expo/vector-icons'
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import TrackPlayer, { useIsPlaying } from 'react-native-track-player'
import api_ikun from '@/components/utils/musicSdk/tx/api-ikun'
import { awaitExpression } from '@babel/types'
import { useLibraryStore } from '@/store/library'

type PlayerControlsProps = {
	style?: ViewStyle
}

type PlayerButtonProps = {
	style?: ViewStyle
	iconSize?: number
}

export const PlayerControls = ({ style }: PlayerControlsProps) => {
	return (
		<View style={[styles.container, style]}>
			<View style={styles.row}>
				<SkipToPreviousButton />

				<PlayPauseButton />

				<SkipToNextButton />
			</View>
		</View>
	)
}

export const PlayPauseButton = ({ style, iconSize = 48 }: PlayerButtonProps) => {
	const { playing } = useIsPlaying()

	return (
		<View style={[{ height: iconSize }, style]}>
			<TouchableOpacity
				activeOpacity={0.85}
				onPress={playing ? TrackPlayer.pause : TrackPlayer.play}
			>
				<FontAwesome6 name={playing ? 'pause' : 'play'} size={iconSize} color={colors.text} />
			</TouchableOpacity>
		</View>
	)
}



export const SkipToNextButton = ({ iconSize = 30 }: PlayerButtonProps) => {
	const { tracks, fetchTracks } = useLibraryStore((state) => ({
    tracks: state.tracks,
    fetchTracks: state.fetchTracks,
  }))
 const mySkipToNext = async () => {
		// console.log('SkipToNextButton')
    const currentTrackId = await TrackPlayer.getTrack(await TrackPlayer.getCurrentTrack())
    const currentTrackIndex = tracks.findIndex(track => track.id === currentTrackId.id)
    if (currentTrackIndex !== -1 && currentTrackIndex < tracks.length - 1) {
			// console.log('currentTrackIndex'+currentTrackIndex)
			// console.log(JSON.stringify(await TrackPlayer.getQueue()))
      const nextTrack = tracks[currentTrackIndex + 1]//如果是随机播放呢？
			if(nextTrack.url=='Unknown') {
				nextTrack.url = await api_ikun.getMusicUrl(nextTrack,'128k').then((re)=>re.url)
			}
      await TrackPlayer.load(nextTrack)

    }else if(currentTrackIndex === tracks.length - 1){
			if(tracks[0].url=='Unknown'){
				tracks[0].url = await api_ikun.getMusicUrl(tracks[0],'128k').then((re)=>re.url)
			}
      await TrackPlayer.load(tracks[0])
		} else {
      console.log('No more tracks to skip to.')
    }
  }

	return (
		<TouchableOpacity activeOpacity={0.7} onPress={mySkipToNext}>
			<FontAwesome6 name="forward" size={iconSize} color={colors.text} />
		</TouchableOpacity>
	)
}

export const SkipToPreviousButton = ({ iconSize = 30 }: PlayerButtonProps) => {
	return (
		<TouchableOpacity activeOpacity={0.7} onPress={() => TrackPlayer.skipToPrevious()}>
			<FontAwesome6 name={'backward'} size={iconSize} color={colors.text} />
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		alignItems: 'center',
	},
})
