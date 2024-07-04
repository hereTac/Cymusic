import library from '@/assets/data/library.json'
import { unknownTrackImageUri } from '@/constants/images'
import { Artist, Playlist, TrackWithPlaylist } from '@/helpers/types'
import { Track } from 'react-native-track-player'
import { create } from 'zustand'
import { useEffect } from 'react'
import musicSdk from '@/components/utils/musicSdk'
import api_ikun from '@/components/utils/musicSdk/tx/api-ikun'
interface LibraryState {
  tracks: TrackWithPlaylist[]
  toggleTrackFavorite: (track: Track) => void
  addToPlaylist: (track: Track, playlistName: string) => void
  fetchTracks: () => Promise<void>
}
const mapTrack = (track: { songmid: any; url: any; name: any; singer: any; albumName: any; genre: any; releaseDate: any; img: any; interval: any; singerImg: any  }) => {
  return {
   id: track.songmid || 'default_songmid',   // 如果 songmid 为 undefined 或 null，设置默认值 'default_songmid'
   url: track.url || 'Unknown',   // 如果 url 为 undefined 或 null，设置默认值 'http://example.com/default.mp3'
   title: track.name || 'Untitled Song',   // 如果 name 为 undefined 或 null，设置默认值 'Untitled Song'
   artist: track.singer || 'Unknown Artist',   // 如果 singer 为 undefined 或 null，设置默认值 'Unknown Artist'
   album: track.albumName || 'Unknown Album',   // 如果 albumName 为 undefined 或 null，设置默认值 'Unknown Album'
   genre: track.genre || 'Unknown Genre',   // 如果 genre 为 undefined 或 null，设置默认值 'Unknown Genre'
   date: track.releaseDate || 'Unknown Release Date',   // 如果 releaseDate 为 undefined 或 null，设置默认值 'Unknown Release Date'
   artwork: track.img || 'http://example.com/default.jpg',   // 如果 img 为 undefined 或 null，设置默认值 'http://example.com/default.jpg'
   duration:  0,   // 如果 interval 为 undefined 或 null，设置默认值 0
   singerImg: track.singerImg || 'http://example.com/default_artist.jpg'
  };
};
export const useLibraryStore = create<LibraryState>((set) => ({
  tracks: [],
  toggleTrackFavorite: (track) =>
    set((state) => ({
      tracks: state.tracks.map((currentTrack) => {
        if (currentTrack.url === track.url) {
          return {
            ...currentTrack,
            rating: currentTrack.rating === 1 ? 0 : 1,
          }
        }

        return currentTrack
      }),
    })),
  addToPlaylist: (track, playlistName) =>
    set((state) => ({
      tracks: state.tracks.map((currentTrack) => {
        if (currentTrack.url === track.url) {
          return {
            ...currentTrack,
            playlist: [...(currentTrack.playlist ?? []), playlistName],
          }
        }

        return currentTrack
      }),
    })),
  fetchTracks: async () => {
    try {
      const data = await musicSdk["tx"].leaderboard.getList(26, 1)
       // console.log("list"+JSON.stringify(data.list))
      let tracks = data.list.map(mapTrack);

      tracks= tracks.slice(0, 10);
      // console.log(tracks);

      set({ tracks})
    } catch (error) {
      console.error('Failed to fetch tracks:', error)
    }
  },
}))

export const useTracks = () => {
  const { tracks, fetchTracks } = useLibraryStore()
  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])
  return tracks
}

export const useFavorites = () => {
  const favorites = useLibraryStore((state) => state.tracks.filter((track) => track.rating === 1))
  const toggleTrackFavorite = useLibraryStore((state) => state.toggleTrackFavorite)

  return {
    favorites,
    toggleTrackFavorite,
  }
}

export const useArtists = () =>
  useLibraryStore((state) => {
    return state.tracks.reduce((acc, track) => {
      const existingArtist = acc.find((artist) => artist.name === track.artist)

      if (existingArtist) {
        existingArtist.tracks.push(track)
      } else {
        acc.push({
          name: track.artist ?? 'Unknown',
          tracks: [track],
          singerImg:track.singerImg
        })
      }

      return acc
    }, [] as Artist[])
  })

export const usePlaylists = () => {
  const playlists = useLibraryStore((state) => {
    return state.tracks.reduce((acc, track) => {
      track.playlist?.forEach((playlistName) => {
        const existingPlaylist = acc.find((playlist) => playlist.name === playlistName)

        if (existingPlaylist) {
          existingPlaylist.tracks.push(track)
        } else {
          acc.push({
            name: playlistName,
            tracks: [track],
            artworkPreview: track.artwork ?? unknownTrackImageUri,
            singerImg: track.singerImg
          })
        }
      })

      return acc
    }, [] as Playlist[])
  })

  const addToPlaylist = useLibraryStore((state) => state.addToPlaylist)

  return { playlists, addToPlaylist }
}
