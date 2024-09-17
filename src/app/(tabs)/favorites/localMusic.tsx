import localImage from '@/assets/local.png'
import { PlaylistTracksList } from '@/components/PlaylistTracksList'
import { unknownTrackImageUri } from '@/constants/images'
import { screenPadding } from '@/constants/tokens'
import { logError, logInfo } from '@/helpers/logger'
import myTrackPlayer, { importedLocalMusicStore } from '@/helpers/trackPlayerIndex'
import { Playlist } from '@/helpers/types'
import { searchMusicInfoByName } from '@/helpers/userApi/getMusicSource'
import { defaultStyles } from '@/styles'
import MusicInfo from '@/utils/musicInfo'
import * as DocumentPicker from 'expo-document-picker'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, View } from 'react-native'
import { Track } from 'react-native-track-player'
const LocalMusicScreen = () => {
	const localTracks = importedLocalMusicStore.useValue()
	const [isLoading, setIsLoading] = useState(false)
	const playListItem = {
		name: 'Local',
		id: 'local',
		tracks: [],
		title: '本地的歌曲',
		coverImg: Image.resolveAssetSource(localImage).uri,
		description: '在本地的歌曲',
	}

	const importLocalMusic = async () => {
		try {
			setIsLoading(true)
			const result = await DocumentPicker.getDocumentAsync({
				type: 'audio/*',
				multiple: true,
			})

			if (result.canceled) {
				logInfo('用户取消了文件选择')
				setIsLoading(false)
				return
			}
			console.log('result.assets:', result.assets)
			if (result.assets.length > 50) {
				Alert.alert('提示', '一次最多只能导入50首歌曲')
				setIsLoading(false)
				return
			}
			const newTracks: IMusic.IMusicItem[] = await Promise.all(
				result.assets
					.filter((file) => !myTrackPlayer.isExistImportedLocalMusic(file.name))
					.map(async (file) => {
						const metadata = await MusicInfo.getMusicInfoAsync(file.uri, {
							title: true,
							artist: true,
							album: true,
							genre: true,
							picture: true,
						})

						// console.log('文件元数据:', metadata)

						return {
							id: file.uri,
							title: metadata?.title || file.name || '未知标题',
							artist: metadata?.artist || '未知艺术家',
							album: metadata?.album || '未知专辑',
							artwork: unknownTrackImageUri,
							url: file.uri,
							platform: 'local',
							duration: 0, // 如果 MusicInfo 能提供持续时间，可以在这里使用
							genre: file.name || '',
						}
					}),
			)
			// console.log('newTracks:', newTracks)
			if (newTracks.length === 0) {
				console.log('没有新导入的音轨')
				// Alert.alert('提示', '没有新的音乐被导入。可能是因为所选文件已存在或不是支持的音频格式。')
				setIsLoading(false)
				return
			}

			// console.log('新导入的音轨:', newTracks)
			// 批量处理新导入的音轨
			const processedTracks = await Promise.all(
				newTracks.map(async (track) => {
					if (track.title !== '未知标题') {
						try {
							console.log(track.title)
							const searchResult = await searchMusicInfoByName(track.title)
							logInfo('搜索结果:', searchResult)
							if (searchResult != null) {
								return {
									...track,
									id: searchResult.songmid || track.id,
									artwork: searchResult.artwork || track.artwork,
									album: searchResult.albumName || track.album,
								}
							} else {
								logError('没有匹配到歌曲')
							}
						} catch (error) {
							logError(`获取歌曲 "${track.title}" 信息时出错:`, error)
						}
					}
					return track
				}),
			)

			console.log('处理后的音轨:', processedTracks)

			// setLocalTracks((prevTracks) => [...prevTracks, ...newTracks])
			myTrackPlayer.addImportedLocalMusic(processedTracks)
			// logInfo('导入的本地音乐:', newTracks)
		} catch (err) {
			logError('导入本地音乐时出错:', err)
		} finally {
			setIsLoading(false)
		}
	}

	function deleteLocalMusic(trackId: string): void {
		myTrackPlayer.deleteImportedLocalMusic(trackId)
	}

	return (
		<View style={defaultStyles.container}>
			{isLoading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#fff" />
				</View>
			)}
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{ paddingHorizontal: screenPadding.horizontal }}
			>
				<PlaylistTracksList
					playlist={playListItem as Playlist}
					tracks={localTracks as Track[]}
					showImportMenu={true}
					onImportTrack={importLocalMusic}
					allowDelete={true}
					onDeleteTrack={deleteLocalMusic}
				/>
			</ScrollView>
		</View>
	)
}
const styles = StyleSheet.create({
	loadingOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
		zIndex: 1000,
	},
})
export default LocalMusicScreen
