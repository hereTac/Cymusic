import { fontSize } from '@/constants/tokens'
import { generateTracksListId } from '@/helpers/miscellaneous'
import { Playlist } from '@/helpers/types'
import { defaultStyles } from '@/styles'
import { StyleSheet, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { Track } from 'react-native-track-player'
import { QueueControls } from './QueueControls'
import { TracksList } from './TracksList'

type PlaylistTracksListProps = {
	playlist: Playlist
	tracks: Track[]
	allowDelete?: boolean
	onDeleteTrack?: (trackId: string) => void
}

export const PlaylistTracksList = ({
	playlist,
	tracks,
	allowDelete = false,
	onDeleteTrack,
}: PlaylistTracksListProps) => {
	// const filteredPlaylistTracks = useMemo(() => {
	// 	return playlist.tracks.filter(trackTitleFilter(search))
	// }, [playlist.tracks, search])

	return (
		<TracksList
			id={generateTracksListId(playlist.title)}
			scrollEnabled={false}
			hideQueueControls={true}
			ListHeaderComponentStyle={styles.playlistHeaderContainer}
			ListHeaderComponent={
				<View>
					<View style={styles.artworkImageContainer}>
						<FastImage
							source={{
								uri: playlist.coverImg || playlist.artwork,
								priority: FastImage.priority.high,
							}}
							style={styles.artworkImage}
						/>
					</View>

					<Text numberOfLines={1} style={styles.playlistNameText}>
						{playlist.title}
					</Text>

					<QueueControls style={{ paddingTop: 24 }} tracks={tracks} />
				</View>
			}
			tracks={tracks}
			allowDelete={allowDelete}
			onDeleteTrack={onDeleteTrack}
		/>
	)
}

const styles = StyleSheet.create({
	playlistHeaderContainer: {
		flex: 1,
		marginBottom: 32,
	},
	artworkImageContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		height: 300,
	},
	artworkImage: {
		width: '85%',
		height: '100%',
		resizeMode: 'cover',
		borderRadius: 12,
	},
	playlistNameText: {
		...defaultStyles.text,
		marginTop: 22,
		textAlign: 'center',
		fontSize: fontSize.lg,
		fontWeight: '800',
	},
})
