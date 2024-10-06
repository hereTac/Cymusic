import rpx from '@/utils/rpx'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface ILyricOperationsProps {
	scrollToCurrentLrcItem: () => void
}

export default function LyricOperations(props: ILyricOperationsProps) {
	return <View style={styles.container}></View>
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
})
