// src/app/modals/settingModal.tsx
import { colors } from '@/constants/tokens'
import myTrackPlayer, {
	musicApiSelectedStore,
	musicApiStore,
	nowApiState,
	useCurrentQuality,
} from '@/helpers/trackPlayerIndex'
import { MenuView } from '@react-native-menu/menu'
import Constants from 'expo-constants'
import * as DocumentPicker from 'expo-document-picker'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	Linking,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import RNFS from 'react-native-fs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
const QUALITY_OPTIONS = ['128k', '320k', 'flac']
const CURRENT_VERSION = Constants.expoConfig?.version ?? '未知版本'

// eslint-disable-next-line react/prop-types
const MusicQualityMenu = ({ currentQuality, onSelectQuality }) => {
	const handlePressAction = async (id: string) => {
		if (QUALITY_OPTIONS.includes(id)) {
			onSelectQuality(id)
		}
	}

	return (
		<MenuView
			onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
			actions={QUALITY_OPTIONS.map((quality) => ({
				id: quality,
				title: quality,
				state: currentQuality === quality ? 'on' : 'off',
			}))}
		>
			<TouchableOpacity style={styles.menuTrigger}>
				<Text style={styles.menuTriggerText}>{currentQuality}</Text>
			</TouchableOpacity>
		</MenuView>
	)
}
// eslint-disable-next-line react/prop-types
const MusicSourceMenu = ({ isDelete, onSelectSource }) => {
	const [sources, setSources] = useState([])
	const selectedApi = musicApiSelectedStore.useValue()
	const musicApis = musicApiStore.useValue()

	useEffect(() => {
		if (musicApis && Array.isArray(musicApis)) {
			setSources(
				musicApis.map((api) => ({
					id: api.id,
					title: api.name,
				})),
			)
		} else {
			setSources([]) // 如果 musicApis 不是有效数组，设置为空数组
		}
	}, [musicApis])

	const handlePressAction = async (id: string) => {
		onSelectSource(id)
	}

	return (
		<MenuView
			onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
			actions={sources.map((source) => ({
				id: source.id,
				title: isDelete ? `删除 ${source.title}` : source.title,
				state: isDelete ? 'off' : selectedApi && selectedApi.id === source.id ? 'on' : 'off',
				attributes: isDelete ? { destructive: true } : undefined,
			}))}
		>
			<TouchableOpacity style={[styles.menuTrigger]}>
				<Text style={[styles.menuTriggerText]}>
					{isDelete ? '选择删除' : selectedApi ? selectedApi.name : '选择音源'}
				</Text>
			</TouchableOpacity>
		</MenuView>
	)
}

const settingsData = [
	{
		title: '应用信息',
		data: [
			{ id: '1', title: 'CyMusic', type: 'link', icon: require('@/assets/144.png') },
			{ id: '2', title: '版本号', type: 'value', value: CURRENT_VERSION },
			{ id: '3', title: '检查更新', type: 'value' },
			{ id: '5', title: '项目链接', type: 'value', value: '' },
			{ id: '9', title: '清空缓存', type: 'value', value: '' },
		],
	},
	{
		title: '音频设置',
		data: [{ id: '6', title: '清空待播清单', type: 'link' }],
	},
	{
		title: '自定义音源',
		data: [
			{ id: '11', title: '切换音源', type: 'custom' },
			{ id: '7', title: '音源状态', type: 'value', value: nowApiState.useValue() },
			{ id: '12', title: '删除音源', type: 'value', value: '' },
			{ id: '8', title: '导入音源', type: 'link' },
		],
	},
	{
		title: '音质选择',
		data: [{ id: '10', title: '当前音质', type: 'value' }],
	},
]
interface ModuleExports {
	id?: string
	author?: string
	name?: string
	version?: string
	srcUrl?: string
	getMusicUrl?: (
		songname: string,
		artist: string,
		songmid: string,
		quality: string,
	) => Promise<string>
}

const importMusicSource = async () => {
	try {
		const result = await DocumentPicker.getDocumentAsync({
			type: 'text/javascript',
			copyToCacheDirectory: false,
		})

		if (result.canceled === true) {
			console.log('User canceled document picker')
			return
		}

		console.log('File selected:', result.assets[0].uri)
		const fileUri = decodeURIComponent(result.assets[0].uri)
		const fileContents = await RNFS.readFile(fileUri, 'utf8')
		console.log('File contents:', fileContents)
		// 模拟 Node.js 的模块系统
		const module: { exports: ModuleExports } = { exports: {} }
		const require = () => {} // 如果文件中有其他 require 调用，你需要在这里实现
		const moduleFunc = new Function('module', 'exports', 'require', fileContents)
		moduleFunc(module, module.exports, require)
		const url = await module.exports.getMusicUrl('朵', '赵雷', '004IArbh3ytHgR', '128k')
		console.log(url + '123123')
		// 从模块导出创建 MusicApi 对象
		const musicApi: IMusic.MusicApi = {
			id: module.exports.id || '',
			platform: 'tx', // 平台目前默认tx
			author: module.exports.author || '',
			name: module.exports.name || '',
			version: module.exports.version || '',
			srcUrl: module.exports.srcUrl || '',
			script: fileContents, //
			isSelected: false,
			getMusicUrl: module.exports.getMusicUrl,
		}

		myTrackPlayer.addMusicApi(musicApi)
		return
	} catch (err) {
		console.error('Error importing music source:', err)
		Alert.alert('导入失败', '无法导入音源，请确保文件格式正确并稍后再试。')
	}
}
const SettingModal = () => {
	const router = useRouter()
	const [currentQuality, setCurrentQuality] = useCurrentQuality()
	const [isQualitySelectorVisible, setIsQualitySelectorVisible] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const DismissPlayerSymbol = () => {
		const { top } = useSafeAreaInsets()
		return (
			<View style={[styles.dismissSymbol, { top: top - 25 }]}>
				<View style={styles.dismissBar} />
			</View>
		)
	}

	const handleSelectSource = (sourceId) => {
		myTrackPlayer.setMusicApiAsSelectedById(sourceId)

		//setCurrentSource(sourceId);
		// 这里你需要实现切换音源的逻辑
		// 例如：myTrackPlayer.setMusicApiAsSelectedById(sourceId);
	}

	const handleDeleteSource = (sourceId) => {
		myTrackPlayer.deleteMusicApiById(sourceId)
	}
	const checkForUpdates = async () => {
		setIsLoading(true)
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error('请求超时')), 10000),
		)
		try {
			const result = await Promise.race([
				fetch('https://api.github.com/repos/gyc-12/music-player-master/releases/latest'),
				timeoutPromise,
			])
			if (!(result instanceof Response)) {
				throw new Error('非预期的结果类型')
			}

			if (!result.ok) {
				throw new Error(`HTTP error! status: ${result.status}`)
			}
			const data = await result.json()
			const latestVersion = data.tag_name
			console.log(CURRENT_VERSION + 'CURRENT_VERSIONCURRENT_VERSION' + latestVersion)

			if (latestVersion !== CURRENT_VERSION) {
				Alert.alert('新版本可用', `发现新版本 ${latestVersion}，请更新。`, [
					{ text: '确定', onPress: () => Linking.openURL(data.html_url) },
					{ text: '取消', onPress: () => {}, style: 'cancel' },
				])
			} else {
				Alert.alert('已是最新版本', '当前已是最新版本。')
			}
		} catch (error) {
			console.error('检查更新失败', error)
			Alert.alert('检查更新失败', '无法检查更新，请稍后再试。')
		} finally {
			setIsLoading(false)
		}
	}
	const renderItem = (item, index, sectionData) => (
		<View key={item.id}>
			<TouchableOpacity
				key={item.id}
				style={[
					styles.item,
					index === 0 && styles.firstItem,
					index === sectionData.length - 1 && styles.lastItem,
				]}
				onPress={() => {
					if (item.title === '项目链接') {
						Linking.openURL('https://github.com/gyc-12/music-player-master').catch((err) =>
							console.error("Couldn't load page", err),
						)
					} else if (item.title === '当前音质') {
						setIsQualitySelectorVisible(true)
					} else if (item.type === 'link') {
						if (item.title === '清空待播清单') {
							Alert.alert('清空待播清单', '确定要清空待播清单吗？', [
								{ text: '取消', style: 'cancel' },
								{ text: '确定', onPress: () => myTrackPlayer.clearToBePlayed() },
							])
						} else if (item.title === '导入音源') {
							importMusicSource()
						}
						console.log(`Navigate to ${item.title}`)
					} else if (item.title === '检查更新') {
						checkForUpdates()
					}
				}}
			>
				{item.icon && <Image source={item.icon} style={styles.icon} />}
				<View style={styles.itemContent}>
					<Text style={styles.itemText}>{item.title}</Text>
					{item.type === 'switch' && (
						<Switch
							value={item.value}
							onValueChange={(newValue) => {
								console.log(`${item.title} switched to ${newValue}`)
							}}
						/>
					)}
					{item.type === 'value' && <Text style={styles.itemValue}>{item.value}</Text>}
					{item.title === '当前音质' && (
						<MusicQualityMenu currentQuality={currentQuality} onSelectQuality={setCurrentQuality} />
					)}
					{item.title === '切换音源' && (
						<MusicSourceMenu isDelete={false} onSelectSource={handleSelectSource} />
					)}
					{item.title === '删除音源' && (
						<MusicSourceMenu isDelete={true} onSelectSource={handleDeleteSource} />
					)}
					{(item.type === 'link' || item.title === '项目链接') && !item.icon && (
						<Text style={styles.arrowRight}>{'>'}</Text>
					)}
				</View>
			</TouchableOpacity>
			{index !== sectionData.length - 1 && <View style={styles.separator} />}
		</View>
	)
	const GlobalLoading = () => (
		<View style={styles.loadingOverlay}>
			<ActivityIndicator size="large" color={colors.loading} />
		</View>
	)
	return (
		<View style={styles.container}>
			<DismissPlayerSymbol />
			<Text style={styles.header}>设置</Text>
			<ScrollView style={styles.scrollView}>
				{settingsData.map((section, index) => (
					<View key={index} style={styles.section}>
						<Text style={styles.sectionTitle}>{section.title}</Text>
						<View style={styles.sectionContent}>{section.data.map(renderItem)}</View>
					</View>
				))}
			</ScrollView>
			{isLoading && <GlobalLoading />}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	dismissSymbol: {
		position: 'absolute',
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		zIndex: 1,
	},
	dismissBar: {
		width: 50,
		height: 8,
		borderRadius: 8,
		backgroundColor: '#fff',
		opacity: 0.7,
	},
	header: {
		fontSize: 34,
		fontWeight: 'bold',
		padding: 20,
		paddingTop: 50,
		color: colors.text,
	},
	scrollView: {
		flex: 1,
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.text,
		marginLeft: 20,
		marginBottom: 5,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		// 移除 borderBottomWidth 和 borderBottomColor
	},
	firstItem: {
		borderBottomWidth: 0,
	},
	lastItem: {
		borderBottomWidth: 0, // 确保最后一项没有底部边框
	},
	separator: {
		left: 16,
		right: 16,
		height: 1,
		backgroundColor: colors.maximumTrackTintColor,
	},
	sectionContent: {
		backgroundColor: 'rgb(32,32,32)',
		borderRadius: 10,
		marginHorizontal: 16,
		overflow: 'hidden', // 确保圆角不被分隔线覆盖
	},
	icon: {
		width: 30,
		height: 30,
		marginRight: 10,
		borderRadius: 6,
	},
	itemContent: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	itemText: {
		fontSize: 16,
		color: colors.text,
	},
	itemValue: {
		fontSize: 16,
		color: colors.textMuted,
	},
	arrowRight: {
		fontSize: 18,
		color: colors.textMuted,
	},
	menuTrigger: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	menuTriggerText: {
		fontSize: 16,
		color: colors.textMuted,
	},
	loadingOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
})

export default SettingModal
