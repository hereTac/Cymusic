import { MovingText } from '@/components/MovingText'
import { PlayerControls } from '@/components/PlayerControls'
import { PlayerProgressBar } from '@/components/PlayerProgressbar'
import { PlayerRepeatToggle } from '@/components/PlayerRepeatToggle'
import { PlayerVolumeBar } from '@/components/PlayerVolumeBar'
import { ShowPlayerListToggle } from '@/components/ShowPlayerListToggle'
import { unknownTrackImageUri } from '@/constants/images'
import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { nowLyricState } from '@/helpers/trackPlayerIndex'
import { getSingerMidBySingerName } from '@/helpers/userApi/getMusicSource'
import { usePlayerBackground } from '@/hooks/usePlayerBackground'
import { useTrackPlayerFavorite } from '@/hooks/useTrackPlayerFavorite'
import usePlayerStore from '@/store/usePlayerStore'
import { defaultStyles } from '@/styles'
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import { MenuView } from '@react-native-menu/menu'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Linking,
	Share,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { Lyric } from 'react-native-lyric'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActiveTrack, usePlaybackState, useProgress } from 'react-native-track-player'
const PlayerScreen = () => {
	const { top, bottom } = useSafeAreaInsets()
	const { isFavorite, toggleFavorite } = useTrackPlayerFavorite()
	const [showLyrics, setShowLyrics] = useState(false)
	const { duration, position } = useProgress(250)
	const lyricsOpacity = useSharedValue(0)
	const lyricsTranslateY = useSharedValue(50)
	const artworkScale = useSharedValue(1)

	const playbackState = usePlaybackState()
	const isPlaying = playbackState.state === 'playing'

	const lyricsAnimatedStyle = useAnimatedStyle(() => ({
		opacity: lyricsOpacity.value,
		transform: [{ translateY: lyricsTranslateY.value }],
	}))

	const artworkAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: artworkScale.value }],
	}))
	const handleLyricsToggle = () => {
		const newShowLyrics = !showLyrics
		setShowLyrics(newShowLyrics)
		if (newShowLyrics) {
			lyricsOpacity.value = withTiming(1, { duration: 300 })
			lyricsTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 })
		} else {
			lyricsOpacity.value = withTiming(0, { duration: 300 })
			lyricsTranslateY.value = withSpring(50, { damping: 15, stiffness: 100 })
		}
	}

	useEffect(() => {
		if (isPlaying) {
			// 放大时使用 withSpring 实现弹性效果
			artworkScale.value = withSpring(1, {
				damping: 9,
				stiffness: 180,
				mass: 1,
				velocity: 0,
			})
		} else {
			// 缩小时使用 withTiming 实现线性效果
			artworkScale.value = withTiming(0.7, {
				duration: 300,
				easing: Easing.linear,
			})
		}
	}, [isPlaying])

	const {
		isLoading,
		isInitialized,
		prevTrack,
		activeTrack,
		setLoading,
		setInitialized,
		setPrevTrack,
		setActiveTrack,
	} = usePlayerStore()
	const nowLyric = nowLyricState.getValue() || '[00:00.00]暂无歌词'
	const currentActiveTrack = useActiveTrack()

	const { imageColors } = usePlayerBackground(currentActiveTrack?.artwork ?? unknownTrackImageUri)
	const lineRenderer = useCallback(
		({ lrcLine: { millisecond, content }, index, active }) => (
			<Text
				style={[
					styles.lyricText,
					{
						color: active ? 'white' : 'gray',
						fontWeight: active ? '700' : '500',
						fontSize: active ? 27 : 19,
						opacity: active ? 1 : 0.6,
					},
				]}
			>
				{content}
			</Text>
		),
		[],
	)
	const handleViewArtist = (artist: string) => {
		if (!artist.includes('未知')) {
			getSingerMidBySingerName(artist).then((singerMid) => {
				if (singerMid) {
					router.navigate(`/(modals)/${singerMid}`)
				} else {
					console.log('没有匹配到歌手')
				}
			})
		}
	}
	const handleArtistSelection = (artists: string) => {
		artists = artists.trim()
		const artistArray = artists.split('、')
		if (artistArray.length === 1) {
			return (
				<TouchableOpacity
					activeOpacity={0.6}
					onPress={() => handleViewArtist(artists)}
					accessibilityRole="button"
					accessibilityHint={`View artist ${artists}`}
				>
					<Text numberOfLines={1} style={[styles.trackArtistText, { marginTop: 6 }]}>
						{artists}
					</Text>
				</TouchableOpacity>
			)
		} else {
			// 使用 MenuView 显示歌手选择菜单
			return (
				<MenuView
					title="选择歌手"
					onPressAction={({ nativeEvent }) => {
						handleViewArtist(nativeEvent.event)
					}}
					actions={artistArray.map((artist) => ({
						id: artist,
						title: artist,
					}))}
				>
					<TouchableOpacity
						activeOpacity={0.6}
						accessibilityRole="button"
						accessibilityHint={`View artist ${artists}`}
					>
						<Text numberOfLines={1} style={[styles.trackArtistText, { marginTop: 6 }]}>
							{artists}
						</Text>
					</TouchableOpacity>
				</MenuView>
			)
		}
	}
	useEffect(() => {
		const checkTrackLoading = async () => {
			if (!isInitialized) {
				setInitialized(true)
				setActiveTrack(currentActiveTrack)
				setPrevTrack(currentActiveTrack)
			} else if (!currentActiveTrack && !prevTrack) {
				// console.log('prevTrack new ', prevTrack);
				setLoading(true)
			} else if (currentActiveTrack && currentActiveTrack.id !== prevTrack.id) {
				setLoading(true)
				// Simulate a delay to ensure track is fully loaded
				await new Promise((resolve) => setTimeout(resolve, 50))
				setLoading(false)
				setPrevTrack(currentActiveTrack) // Update previous track when the new track is fully loaded
			}
			setActiveTrack(currentActiveTrack)
		}
		if (currentActiveTrack !== undefined) {
			// console.log('currentActiveTrack new :::::', currentActiveTrack);
			checkTrackLoading()
		}
	}, [currentActiveTrack])

	const trackToDisplay = activeTrack || prevTrack // Use previous track if active track is null

	// 用于同步歌词的时间
	const [currentLyricTime, setCurrentLyricTime] = useState(position * 1000)

	// 更新当前歌词时间的函数
	const handleSeek = (newPosition) => {
		setCurrentLyricTime(newPosition * 1000)
	}
	const handleFavorite = () => {
		toggleFavorite()
	}

	const handleShowAlbum = () => {
		// 实现显示专辑的逻辑
		router.push(`/(modals)/${trackToDisplay.album}?album=true`)
	}

	const handleShowLyrics = () => {
		// 实现显示歌词的逻辑
		handleLyricsToggle()
	}

	const handleAddToPlaylist = () => {
		// 实现添加到歌单的逻辑
		const track = trackToDisplay
		console.log('track', track)
		router.push(
			`/(modals)/addToPlaylist?title=${track.title}&album=${track.album}&artwork=${track.artwork}&artist=${track.artist}&id=${track.id}&url=${track.url}&platform=${track.platform}&duration=${track.duration}`,
		)
	}

	const handleDownload = async () => {
		if (trackToDisplay?.url) {
			try {
				const supported = await Linking.canOpenURL(trackToDisplay.url)

				if (supported) {
					await Linking.openURL(trackToDisplay.url)
				} else {
					console.log("Don't know how to open this URL: " + trackToDisplay.url)
					// 可以在这里添加一个提示给用户，说明无法打开此 URL
				}
			} catch (error) {
				console.error('An error occurred while trying to open the URL: ', error)
				// 可以在这里添加一个错误提示给用户
			}
		} else {
			console.log('No URL available for this track')
			// 可以在这里添加一个提示给用户，说明没有可用的下载链接
		}
	}
	const handleShare = async () => {
		try {
			const result = await Share.share({
				title: trackToDisplay?.title,
				message: `歌曲: ${trackToDisplay?.title} by ${trackToDisplay?.artist}`,
				url: trackToDisplay?.url, // 如果有歌曲的在线链接的话
			})

			if (result.action === Share.sharedAction) {
				if (result.activityType) {
					// 分享成功，并且我们知道是通过哪个应用分享的
					console.log(`Shared via ${result.activityType}`)
				} else {
					// 分享成功，但我们不知道是通过哪个应用分享的
					console.log('Shared')
				}
			} else if (result.action === Share.dismissedAction) {
				// 用户取消了分享
				console.log('Share dismissed')
			}
		} catch (error) {
			console.error(error.message)
		}
	}
	const menuActions = [
		{
			id: 'favorite',
			title: isFavorite ? '取消喜欢' : '喜欢',
			titleColor: isFavorite ? colors.primary : undefined,
			image: isFavorite ? 'heart.fill' : 'heart',
		},
		{ id: 'album', title: '显示专辑', image: 'music.note.list' },
		{ id: 'lyrics', title: '查看歌词', image: 'text.quote' },
		{ id: 'playlist', title: '添加到歌单', image: 'plus.circle' },

		{ id: 'share', title: '分享歌曲', image: 'square.and.arrow.up' },
	]
	if (trackToDisplay?.platform !== 'local') {
		menuActions.splice(4, 0, { id: 'download', title: '下载', image: 'arrow.down.circle' })
	}
	useEffect(() => {
		setCurrentLyricTime(position * 1000)
	}, [position])
	return (
		<LinearGradient
			style={{ flex: 1 }}
			colors={imageColors ? [imageColors.background, imageColors.primary] : [colors.background]}
		>
			<View style={styles.overlayContainer}>
				<DismissPlayerSymbol />
				{showLyrics ? (
					<Animated.View style={[styles.lyricContainer, lyricsAnimatedStyle]}>
						<TouchableOpacity
							style={{ backgroundColor: 'transparent', flex: 1 }}
							onPress={handleLyricsToggle}
						>
							<Lyric
								style={styles.lyric}
								lrc={nowLyric}
								currentTime={currentLyricTime}
								autoScroll
								autoScrollAfterUserScroll={500}
								lineHeight={50}
								activeLineHeight={65}
								height={850}
								lineRenderer={lineRenderer}
							/>
						</TouchableOpacity>
					</Animated.View>
				) : (
					<View style={{ flex: 1, marginTop: top + 70, marginBottom: bottom }}>
						<Animated.View style={[styles.artworkImageContainer, artworkAnimatedStyle]}>
							<TouchableOpacity style={styles.artworkTouchable} onPress={handleLyricsToggle}>
								<FastImage
									source={{
										uri: trackToDisplay?.artwork ?? unknownTrackImageUri,
										priority: FastImage.priority.high,
									}}
									resizeMode="cover"
									style={styles.artworkImage}
								/>
							</TouchableOpacity>
						</Animated.View>
						<View style={{ flex: 1 }}>
							<View style={{ marginTop: 'auto' }}>
								<View style={{ height: 60 }}>
									<View
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
										}}
									>
										{/* Track title */}
										<View style={styles.trackTitleContainer}>
											<MovingText
												text={trackToDisplay?.title ?? ''}
												animationThreshold={30}
												style={styles.trackTitleText}
											/>
										</View>

										{/* Favorite button icon */}
										<MenuView
											title="歌曲选项"
											onPressAction={({ nativeEvent }) => {
												switch (nativeEvent.event) {
													case 'favorite':
														handleFavorite()
														break
													case 'album':
														handleShowAlbum()
														break
													case 'lyrics':
														handleShowLyrics()
														break
													case 'playlist':
														handleAddToPlaylist()
														break
													case 'download':
														handleDownload()
														break
													case 'share':
														handleShare()
														break
												}
											}}
											actions={menuActions}
										>
											<TouchableOpacity style={styles.menuButton}>
												<Entypo name="dots-three-horizontal" size={18} color={colors.icon} />
											</TouchableOpacity>
										</MenuView>
									</View>

									{/* Track artist */}
									{trackToDisplay?.artist && handleArtistSelection(trackToDisplay.artist)}
								</View>

								<PlayerProgressBar style={{ marginTop: 32 }} onSeek={handleSeek} />

								<PlayerControls style={{ marginTop: 40 }} />
							</View>

							<PlayerVolumeBar style={{ marginTop: 'auto', marginBottom: 30 }} />

							<View style={styles.container}>
								<View style={styles.leftItem}>
									<MaterialCommunityIcons
										name="tooltip-minus-outline"
										size={27}
										color="white"
										onPress={handleLyricsToggle}
										style={{ marginBottom: 2 }}
									/>
								</View>
								<View style={styles.centeredItem}>
									<PlayerRepeatToggle size={30} style={{ marginBottom: 6 }} />
								</View>
								<View style={styles.rightItem}>
									<ShowPlayerListToggle size={30} style={{ marginBottom: 6 }} />
								</View>
							</View>
						</View>
					</View>
				)}

				{isLoading && (
					<View style={styles.loaderOverlay}>
						<ActivityIndicator size="large" color="#fff" />
					</View>
				)}
			</View>
		</LinearGradient>
	)
}

const DismissPlayerSymbol = () => {
	const { top } = useSafeAreaInsets()

	return (
		<View
			style={{
				position: 'absolute',
				top: top + 8,
				left: 0,
				right: 0,
				flexDirection: 'row',
				justifyContent: 'center',
			}}
		>
			<View
				accessible={false}
				style={{
					width: 50,
					height: 8,
					borderRadius: 8,
					backgroundColor: '#fff',
					opacity: 0.7,
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	menuButton: {
		width: 32, // 增加按钮宽度
		height: 32, // 增加按钮高度
		borderRadius: 16, // 保持圆形（宽度/高度的一半）
		backgroundColor: 'rgba(128, 128, 128, 0.3)', // 半透明的灰色
		justifyContent: 'center',
		alignItems: 'center',
	},
	overlayContainer: {
		...defaultStyles.container,
		paddingHorizontal: screenPadding.horizontal,
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	artworkImageContainer: {
		aspectRatio: 1, // 保持正方形比例
		width: '100%',
		maxHeight: '50%', // 限制最大高度
		alignSelf: 'center',
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: 'grey',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.44,
		shadowRadius: 11.0,
		elevation: 16,
	},
	artworkTouchable: {
		width: '100%',
		height: '100%',
	},
	artworkImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
		borderRadius: 12,
		backgroundColor: 'transparent',
	},
	trackTitleContainer: {
		flex: 1,
		overflow: 'hidden',
	},
	trackTitleText: {
		...defaultStyles.text,
		fontSize: 22,
		fontWeight: '700',
	},
	trackArtistText: {
		...defaultStyles.text,
		fontSize: fontSize.base,
		opacity: 0.8,
		maxWidth: '90%',
	},
	loaderOverlay: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background to indicate loading
	},
	lyricText: {
		...defaultStyles.text,
		textAlign: 'center',
	},
	lyric: {},
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
	},
	leftItem: {
		flex: 1,
		alignItems: 'flex-start',
	},
	centeredItem: {
		flex: 1,
		alignItems: 'center',
	},
	rightItem: {
		flex: 1,
		alignItems: 'flex-end',
	},
	lyricContainer: {
		flex: 1,
	},
})

export default PlayerScreen
