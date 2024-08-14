import { useFavorites } from '@/store/library'
import { useQueue } from '@/store/queue'
import { MenuAction, MenuView } from '@react-native-menu/menu'
import { useFocusEffect, useRouter } from 'expo-router'
import { PropsWithChildren, useState, useCallback, useMemo } from 'react'
import TrackPlayer, { Track } from 'react-native-track-player'
import { match, P } from 'ts-pattern'
import myTrackPlayer from '@/helpers/trackPlayerIndex'
import { isInPlayList } from '@/store/playList'
import { TouchableOpacity } from 'react-native'
import { getSingerInfo } from '@/helpers/userApi/qq-music-api'
import { getSingerMidBySingerName } from '@/helpers/userApi/getMusicSource'

type TrackShortcutsMenuProps = PropsWithChildren<{ track: Track ,isSinger?: boolean}>

export const TrackShortcutsMenu = ({ track, children ,isSinger}: TrackShortcutsMenuProps) => {
  const router = useRouter()
  const { favorites, toggleTrackFavorite } = useFavorites()
  const isFavorite = favorites.find((trackItem) => trackItem.id === track?.id)
  const { activeQueueId } = useQueue()

  const [isInPlaylist, setIsInPlaylist] = useState(false)

  const updateIsInPlaylist = useCallback(() => {
    setIsInPlaylist(isInPlayList(track as IMusic.IMusicItem))
  }, [track])

  useFocusEffect(
    useCallback(() => {
      updateIsInPlaylist()
    }, [updateIsInPlaylist])
  )

  const handleViewArtist = (artist: string) => {
    getSingerMidBySingerName(artist).then((singerMid) => {
     router.push(`/(modals)/${singerMid}`)})
  }

  const artists = useMemo(() => {
    return track.artist.split('、').map(artist => artist.trim())
  }, [track.artist])

  const artistActions = useMemo(() => {
    if (artists.length === 1) {
      return [{
        id: 'view-single-artist',
        title: '查看歌手',
        image: 'person',
      }]
    } else {
      return [{
        id: 'view-artists',
        title: '查看歌手',
        image: 'person',
        subactions: artists.map(artist => ({
          id: `view-artist-${artist}`,
          title: artist,
          image: 'person',
        }))
      }]
    }
  }, [artists])

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
      .with('view-single-artist', async () => {
        handleViewArtist(artists[0])
      })
     .with(P.when((id) => id.startsWith('view-artist-')), (id) => {
      const artist = id.replace('view-artist-', '')
      handleViewArtist(artist)
    })
      .otherwise(() => {
				// handleViewArtist()
				console.warn(`Unknown menu action ${id}`)
			})
  }

  return (
    <MenuView
      onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
      actions={[
        {
          id: isInPlaylist ? 'remove-from-playlist' : 'add-to-playlist',
          title: isInPlaylist ? '从播放列表移除' : '添加到播放列表',
          image: isInPlaylist ? 'minus' : 'plus',
        },
        {
          id: isFavorite ? 'remove-from-favorites' : 'add-to-favorites',
          title: isFavorite ? '从喜爱移除' : '添加到喜爱',
          image: isFavorite ? 'heart.fill' : 'heart',
        },
        ...(isSinger ? [] : artistActions as MenuAction[])

      ]}
    >
      {children}
    </MenuView>
  )
}