
import { unknownTrackImageUri } from '@/constants/images'
import { Artist, Playlist, TrackWithPlaylist } from '@/helpers/types'
import { Track } from 'react-native-track-player'
import { create } from 'zustand'
import { useEffect, useState } from 'react'
import musicSdk from '@/components/utils/musicSdk'

import { setTrackViewList } from '@/store/trackViewList'
import PersistStatus from '@/store/PersistStatus'

interface LibraryState {
  tracks: TrackWithPlaylist[]
  favorites: IMusic.IMusicItem[]
  toggleTrackFavorite: (track: Track) => void
  addToPlaylist: (track: Track, playlistName: string) => void
  fetchTracks: () => Promise<void>
  // setPlayList: (newPlayList: IMusic.IMusicItem[], shouldSave?: boolean) => void
  // getMusicIndex: (musicItem?: IMusic.IMusicItem | null) => number
  // isInPlayList: (musicItem?: IMusic.IMusicItem | null) => boolean
  // getPlayListMusicAt: (index: number) => IMusic.IMusicItem | null
  // isPlayListEmpty: () => boolean
}

const mapTrack = (track: {
  songmid: any
  url: any
  name: any
  singer: any
  albumName: any
  genre: any
  releaseDate: any
  img: any
  interval: any
  singerImg: any
}): TrackWithPlaylist=> {
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
  favorites: PersistStatus.get('music.favorites') || [],
  // playListIndexMap: {},
 toggleTrackFavorite: (track: Track) => {
    set((state) => {
      let favorites = [...state.favorites];
      const index = favorites.findIndex((fav) => fav.id === track.id);

      if (index !== -1) {
        // 如果存在，则从数组中删除
        favorites.splice(index, 1);
      } else {
        // 如果不存在，则添加到数组中
        favorites.push(track as IMusic.IMusicItem);
      }
      // 更新持久化存储中的favorites
      PersistStatus.set('music.favorites', favorites);

      // 返回新的状态
      return { favorites };
    });
  },
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
      const data = await musicSdk['tx'].leaderboard.getList(26, 1)
      platform = data.source;
      let tracks = data.list.map(mapTrack)
      tracks = tracks.slice(0, 100)

      set({ tracks })
    } catch (error) {
      console.error('Failed to fetch tracks:', error)
    }
  },
  // setPlayList: (newPlayList, shouldSave = true) => {
  //   const newIndexMap: Record<string, Record<string, number>> = {}
  //   newPlayList.forEach((item, index) => {
  //     if (!newIndexMap[item.platform]) {
  //       newIndexMap[item.platform] = {
  //         [item.id]: index,
  //       }
  //     } else {
  //       newIndexMap[item.platform][item.id] = index
  //     }
  //   })
  //   set({
  //     tracks: newPlayList,
  //     playListIndexMap: newIndexMap,
  //   })
  //
  // },
  // getMusicIndex: (musicItem) => {
  //   if (!musicItem) {
  //     return -1
  //   }
  //   const { playListIndexMap } = useLibraryStore.getState()
  //   return playListIndexMap[musicItem.platform]?.[musicItem.id] ?? -1
  // },
  // isInPlayList: (musicItem) => {
  //   if (!musicItem) {
  //     return false
  //   }
  //   const { playListIndexMap } = useLibraryStore.getState()
  //   return playListIndexMap[musicItem.platform]?.[musicItem.id] > -1
  // },
  // getPlayListMusicAt: (index) => {
  //   const { tracks } = useLibraryStore.getState()
  //   const len = tracks.length
  //   if (len === 0) {
  //     return null
  //   }
  //   return tracks[(index + len) % len]
  // },
  // isPlayListEmpty: () => {
  //   const { tracks } = useLibraryStore.getState()
  //   return tracks.length === 0
  // },
}))

export const useTracks = () => {
  const { tracks, fetchTracks } = useLibraryStore()
  useEffect(() => {
     fetchTracks()
  }, [fetchTracks])
  return tracks
}
// export const useSetPlayList = () => {
//   const { tracks, setPlayList } = useLibraryStore()
//   useEffect(() => {
//      setPlayList(tracks)
//   }, [setPlayList])
//   return tracks
// }

export const useFavorites = () => {
  const favorites = useLibraryStore((state) =>
    state.favorites
  )
const toggleTrackFavorite = useLibraryStore((state) => state.toggleTrackFavorite);
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
          singerImg: track.singerImg,
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
            singerImg: track.singerImg,
          })
        }
      })
      return acc
    }, [] as Playlist[])
  })

  const addToPlaylist = useLibraryStore((state) => state.addToPlaylist)

  return { playlists, addToPlaylist }
}
