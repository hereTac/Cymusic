import { colors } from '@/constants/tokens'
import { useNavigation } from 'expo-router'
import { useLayoutEffect, useState } from 'react'
import { SearchBarProps } from 'react-native-screens'
import { useCallback } from 'react';
import { debounce } from 'lodash';

const defaultSearchOptions: SearchBarProps = {
	tintColor: colors.primary,
	hideWhenScrolling: false,
}//在 TypeScript 中，冒号 : 用于声明变量的类型

export const useNavigationSearch = ({
    searchBarOptions,
}: {
    searchBarOptions?: SearchBarProps
}) => {
    const [search, setSearch] = useState('')

    const navigation = useNavigation()

    const debouncedSetSearch = useCallback(
        debounce((text) => {
            setSearch(text)
        }, 300),
        []
    );

    const handleOnChangeText: SearchBarProps['onChangeText'] = ({ nativeEvent: { text } }) => {
        debouncedSetSearch(text);
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
