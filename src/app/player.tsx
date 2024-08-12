import { MovingText } from '@/components/MovingText'
import { PlayerControls } from '@/components/PlayerControls'
import { PlayerProgressBar } from '@/components/PlayerProgressbar'
import { PlayerRepeatToggle } from '@/components/PlayerRepeatToggle'
import { PlayerVolumeBar } from '@/components/PlayerVolumeBar'
import { ShowPlayerListToggle } from '@/components/ShowPlayerListToggle'
import { unknownTrackImageUri } from '@/constants/images'
import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { usePlayerBackground } from '@/hooks/usePlayerBackground'
import { useTrackPlayerFavorite } from '@/hooks/useTrackPlayerFavorite'
import { useLibraryStore } from '@/store/library'
import usePlayerStore from '@/store/usePlayerStore'
import { defaultStyles } from '@/styles'
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { Lyric } from 'react-native-lyric'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActiveTrack, useProgress } from 'react-native-track-player'
const PlayerScreen = () => {
	const { top, bottom } = useSafeAreaInsets()
	const { isFavorite, toggleFavorite } = useTrackPlayerFavorite()
	const [showLyrics, setShowLyrics] = useState(false)
	const { duration, position } = useProgress(250)
	const lyricsOpacity = useSharedValue(0)
	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: lyricsOpacity.value,
			transform: [
				{
					scale: withTiming(lyricsOpacity.value ? 1 : 1, { duration: 500 }),
				},
			],
		}
	})
	const handleLyricsToggle = () => {
		const newShowLyrics = !showLyrics
		setShowLyrics(newShowLyrics)
		lyricsOpacity.value = withTiming(newShowLyrics ? 1 : 0, { duration: 1000 })
	}
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
	const nowLyric = useLibraryStore.getState().nowLyric
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
					<Animated.View style={[styles.lyricContainer, animatedStyle]}>
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
						<TouchableOpacity style={styles.artworkImageContainer} onPress={handleLyricsToggle}>
							<FastImage
								source={{
									uri: trackToDisplay?.artwork ?? unknownTrackImageUri,
									priority: FastImage.priority.high,
								}}
								resizeMode="cover"
								style={styles.artworkImage}
							/>
						</TouchableOpacity>

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
										<FontAwesome
											name={isFavorite ? 'heart' : 'heart-o'}
											size={20}
											color={isFavorite ? colors.primary : colors.icon}
											style={{ marginHorizontal: 14 }}
											onPress={toggleFavorite}
										/>
									</View>

									{/* Track artist */}
									{trackToDisplay?.artist && (
										<Text numberOfLines={1} style={[styles.trackArtistText, { marginTop: 6 }]}>
											{trackToDisplay.artist}
										</Text>
									)}
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
	overlayContainer: {
		...defaultStyles.container,
		paddingHorizontal: screenPadding.horizontal,
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	artworkImageContainer: {
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.44,
		shadowRadius: 11.0,
		flexDirection: 'row',
		justifyContent: 'center',
		height: '45%',
		borderRadius: 12,
		backgroundColor: '#9ca3af',
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
