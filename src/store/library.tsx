import library from '@/assets/data/library.json'
import { unknownTrackImageUri } from '@/constants/images'
import { Artist, Playlist, TrackWithPlaylist } from '@/helpers/types'
import { Track } from 'react-native-track-player'
import { create } from 'zustand'
import { useEffect } from 'react'
import musicSdk from '@/components/utils/musicSdk'
interface LibraryState {
  tracks: TrackWithPlaylist[]
  toggleTrackFavorite: (track: Track) => void
  addToPlaylist: (track: Track, playlistName: string) => void
  fetchTracks: () => Promise<void>
}
const mapTrack = (track: { songmid: any; url: any; name: any; singer: any; albumName: any; genre: any; releaseDate: any; img: any; interval: any }) => {
  return {
    id: track.songmid, // 假设你的 track 对象有 id 属性
    url: track.url, // 歌曲的 URL
    title: track.name, // 歌曲的名称
    artist: track.singer, // 艺术家的名字
    album: track.albumName, // 专辑名称
    genre: track.genre, // 流派
    date: track.releaseDate, // 发布日期
    artwork: track.img, // 封面图片的 URL
    duration: track.interval, // 歌曲时长（秒）
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
      const data = await musicSdk["kw"].leaderboard.getList(16, 1)
      // console.log("list"+JSON.stringify(data.list))
      const tracks = data.list.map(mapTrack);
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
          })
        }
      })

      return acc
    }, [] as Playlist[])
  })

  const addToPlaylist = useLibraryStore((state) => state.addToPlaylist)

  return { playlists, addToPlaylist }
}
