import { colors } from '@/constants/tokens'
import { nowLanguage } from '@/utils/i18n'
import { useNavigation } from 'expo-router'
import { debounce } from 'lodash'
import { useCallback, useLayoutEffect, useState } from 'react'
import { SearchBarProps } from 'react-native-screens'

const defaultSearchOptions: SearchBarProps = {
	tintColor: colors.primary,
	hideWhenScrolling: false,
} //在 TypeScript 中，冒号 : 用于声明变量的类型

export const useNavigationSearch = ({
	searchBarOptions,
}: {
	searchBarOptions?: SearchBarProps
}) => {
	const [search, setSearch] = useState('')

	const navigation = useNavigation()
	const language = nowLanguage.useValue()

	const debouncedSetSearch = useCallback(
		debounce((text) => {
			setSearch(text)
		}, 400),
		[],
	)

	const handleOnChangeText: SearchBarProps['onChangeText'] = ({ nativeEvent: { text } }) => {
		debouncedSetSearch(text)
	}

	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				...defaultSearchOptions,
				...searchBarOptions,
				onChangeText: handleOnChangeText,
			},
		})
	}, [navigation, searchBarOptions])

	return search
}
