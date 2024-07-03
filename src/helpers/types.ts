import { Track } from 'react-native-track-player'

export type Playlist = {
	name: string
	tracks: Track[]
	artworkPreview: string
	singerImg:string
}

export type Artist = {
	name: string
	tracks: Track[]
	singerImg:string
}

export type TrackWithPlaylist = Track & { playlist?: string[] }
