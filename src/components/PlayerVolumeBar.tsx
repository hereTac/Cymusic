import { colors } from '@/constants/tokens'
import { useTrackPlayerVolume } from '@/hooks/useTrackPlayerVolume'
import { utilsStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons'
import { View, ViewProps } from 'react-native'
import { Slider } from 'react-native-awesome-slider'
import React, { useState } from 'react'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated'

const NORMAL_HEIGHT = 4
const EXPANDED_HEIGHT = 4

export const PlayerVolumeBar = ({ style }: ViewProps) => {
    const { volume, updateVolume } = useTrackPlayerVolume()

    const progress = useSharedValue(0)
    const min = useSharedValue(0)
    const max = useSharedValue(1)
    const isSliding = useSharedValue(false)

    const [trackColor, setTrackColor] = useState(colors.maximumTrackTintColor)

    progress.value = volume ?? 0

    const animatedSliderStyle = useAnimatedStyle(() => {
        return {
            height: withSpring(isSliding.value ? EXPANDED_HEIGHT : NORMAL_HEIGHT),
            transform: [{ scaleY: withSpring(isSliding.value ? 2 : 1) }],
        }
    })

    return (
        <View style={style}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="volume-low" size={20} color={colors.icon} style={{ opacity: 0.8 }} />

                <Animated.View style={[{ flex: 1, flexDirection: 'row', paddingHorizontal: 10 }, animatedSliderStyle]}>
                    <Slider
                        progress={progress}
                        minimumValue={min}
                        containerStyle={utilsStyles.slider}
                        onSlidingStart={() => {
                            isSliding.value = true
                            setTrackColor('#fff') // 触摸时颜色变为白色
                        }}
                        onSlidingComplete={() => {
                            isSliding.value = false
                            setTrackColor(colors.maximumTrackTintColor) // 释放时恢复原始颜色
                        }}
                        onValueChange={(value) => {
                            updateVolume(value)
                        }}
                        renderBubble={() => null}
                        theme={{
                            minimumTrackTintColor: trackColor,
                            maximumTrackTintColor: colors.maximumTrackTintColor,
                        }}
                        thumbWidth={0}
                        maximumValue={max}
                    />
                </Animated.View>

                <Ionicons name="volume-high" size={20} color={colors.icon} style={{ opacity: 0.8 }} />
            </View>
        </View>
    )
}
