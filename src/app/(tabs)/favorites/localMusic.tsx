import localImage from '@/assets/local.png'
import { PlaylistTracksList } from '@/components/PlaylistTracksList'
import { unknownTrackImageUri } from '@/constants/images'
import { screenPadding } from '@/constants/tokens'
import myTrackPlayer, { importedLocalMusicStore } from '@/helpers/trackPlayerIndex'
import { Playlist } from '@/helpers/types'
import { defaultStyles } from '@/styles'
import * as DocumentPicker from 'expo-document-picker'
import React from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { Track } from 'react-native-track-player'
const LocalMusicScreen = () => {
	const localTracks = importedLocalMusicStore.useValue()

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
			const result = await DocumentPicker.getDocumentAsync({
				type: 'audio/*',
				multiple: true,
			})

			if (result.canceled) {
				console.log('用户取消了文件选择')
				return
			}
			// console.log('result.assets:', result.assets)
			// const metadata = await MusicInfo.getMusicInfoAsync(result.assets[0].uri, {
			// 	title: true,
			// 	artist: true,
			// 	album: true,
			// 	genre: true,
			// 	picture: true,
			// })
			// console.log(metadata)
			const newTracks: IMusic.IMusicItem[] = result.assets.map((file) => ({
				id: file.uri,
				title: file.name || '未知标题',
				artist: '未知艺术家',
				album: '未知专辑',
				artwork: unknownTrackImageUri,
				url: file.uri,
				platform: 'local',
				duration: 0,
			}))

			// setLocalTracks((prevTracks) => [...prevTracks, ...newTracks])
			myTrackPlayer.addImportedLocalMusic(newTracks)
			// console.log('导入的本地音乐:', newTracks)
		} catch (err) {
			console.error('导入本地音乐时出错:', err)
		}
	}

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{ paddingHorizontal: screenPadding.horizontal }}
			>
				<PlaylistTracksList
					playlist={playListItem as Playlist}
					tracks={localTracks as Track[]}
					showImportMenu={true}
					onImportTrack={importLocalMusic}
				/>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: '#007AFF',
		padding: 10,
		borderRadius: 5,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		textAlign: 'center',
	},
})
export default LocalMusicScreen
