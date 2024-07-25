import { playbackService } from '@/constants/playbackService'
import { colors } from '@/constants/tokens'
import { useLogTrackPlayerState } from '@/hooks/useLogTrackPlayerState'
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useRef } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import TrackPlayer from 'react-native-track-player'
import { Platform, Dimensions, View } from 'react-native'

const { width, height } = Dimensions.get('window')

SplashScreen.preventAutoHideAsync()

TrackPlayer.registerPlaybackService(() => playbackService)

const App = () => {
	const handleTrackPlayerLoaded = useCallback(() => {
		SplashScreen.hideAsync()
	}, [])

	useSetupTrackPlayer({
		onLoad: handleTrackPlayerLoaded, //播放器初始化后调用这个回调函数。这里先传过去。
	})

	useLogTrackPlayerState()
	// myTrackPlayer.setupTrackPlayer()

	return (
		<SafeAreaProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<RootNavigation />
				<StatusBar style="auto" />
			</GestureHandlerRootView>
		</SafeAreaProvider>
	)
}

const RootNavigation = () => {
	return (
		//每个 Stack.Screen 组件定义了一个可导航的屏幕
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />

			<Stack.Screen
				name="player"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					gestureDirection: 'vertical',
					animationDuration: 400,
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="(modals)/playList"
				options={{
					presentation: 'modal',
					gestureEnabled: true,
					gestureDirection: 'vertical',
					animationDuration: 400,
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="(modals)/addToPlaylist"
				options={{
					presentation: 'modal',
					headerStyle: {
						backgroundColor: colors.background,
					},
					headerTitle: 'Add to playlist',
					headerTitleStyle: {
						color: colors.text,
					},
				}}
			/>
			<Stack.Screen
				name="(modals)/settingModal"
				options={{
			presentation: 'modal',
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'vertical',

				}}
			/>
		</Stack>
	)
}

export default App
