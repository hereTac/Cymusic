import { PlayerRepeatToggle } from '@/components/PlayerRepeatToggle'
import { ShowPlayerListToggle } from '@/components/ShowPlayerListToggle'
import rpx from '@/utils/rpx'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, View } from 'react-native'
interface ILyricOperationsProps {
	scrollToCurrentLrcItem: () => void
}

export default function LyricOperations(props: ILyricOperationsProps) {
	return (
		<View style={styles.container}>
			<View style={styles.leftItem}>
				<MaterialCommunityIcons
					name="tooltip-minus-outline"
					size={27}
					color="white"
					onPress={() => {}}
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
	)
}

const styles = StyleSheet.create({
	container: {
		height: rpx(80),
		marginBottom: rpx(24),
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
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
})
