import { colors } from '@/constants/tokens'
import { useNavigation } from 'expo-router'
import { useLayoutEffect, useState } from 'react'
import { SearchBarProps } from 'react-native-screens'

const defaultSearchOptions: SearchBarProps = {
	tintColor: colors.primary,
	hideWhenScrolling: false,
}//在 TypeScript 中，冒号 : 用于声明变量的类型

export const useNavigationSearch = ({
	searchBarOptions,
}: {
	searchBarOptions?: SearchBarProps
}) => {
	const [search, setSearch] = useState('')//useState 是一个 React 挂钩，可让您为组件添加一个状态变量。

	const navigation = useNavigation()

	const handleOnChangeText: SearchBarProps['onChangeText'] = ({ nativeEvent: { text } }) => {
		setSearch(text)
	}//当 onChangeText 事件触发时，事件对象 event 会被传递给 handleOnChangeText 函数：1、将箭头函数赋值给 handleOnChangeText 变量。
//2、在箭头函数内部，使用 setSearch 函数更新 search 状态变量。handleOnChangeText 变量既是一个箭头函数，也是一个 SearchBarProps['onChangeText'] 类型的变量。关键在于，SearchBarProps['onChangeText'] 本身是一个函数类型，所以将一个箭头函数赋值给 handleOnChangeText 是完全合理的。

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
