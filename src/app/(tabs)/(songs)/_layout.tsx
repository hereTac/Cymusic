import GlobalButton from '@/components/GlobalButton'
import { StackScreenWithSearchBar } from '@/constants/layout'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { View } from 'react-native'

const SongsScreenLayout = () => {
	return (
		<View style={defaultStyles.container}>
			<Stack>
				<Stack.Screen
					name="index"
					options={{
						...StackScreenWithSearchBar,
						headerTitle: 'Songs',
						headerRight: () => <GlobalButton />,
					}}
				/>
			</Stack>
		</View>
	)
}

export default SongsScreenLayout
