import React, { useState } from 'react'
import { StyleSheet, View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'
import { colors, screenPadding } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons'

const ImportPlayList = () => {
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [playlistData, setPlaylistData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const headerHeight = useHeaderHeight()
  const { top } = useSafeAreaInsets()

const handleImport = async () => {
  setIsLoading(true);
  setError(null);
  try {
    // 发起实际的网络请求
    const response = await fetch(playlistUrl);
    const htmlText = await response.text();

    // 提取 firstPageData
    const firstPageDataMatch = htmlText.match(/var firstPageData = ({.*?});/s);
    if (!firstPageDataMatch) {
      throw new Error('无法找到 firstPageData');
    }

    // 提取 JSON 字符串并解析
    const firstPageDataStr = firstPageDataMatch[1];
    const firstPageData = JSON.parse(firstPageDataStr);

    // 设置数据
    setPlaylistData(firstPageData);
  } catch (err) {
    setError('导入失败，请检查链接是否正确');
    console.error('导入错误:', err);
  } finally {
    setIsLoading(false);
  }
};

  const DismissPlayerSymbol = () => (
    <View style={[styles.dismissSymbol, { top: top - 25 }]}>
      <View style={styles.dismissBar} />
    </View>
  )

  return (
  <SafeAreaView style={[styles.modalContainer, { paddingTop: headerHeight }]}>
      <DismissPlayerSymbol />
      <Text style={styles.header}>导入歌单</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>歌单链接</Text>
        <TextInput
          style={styles.input}
          value={playlistUrl}
          onChangeText={setPlaylistUrl}
          placeholder="🔗输入企鹅音乐歌单链接"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleImport} activeOpacity={0.8} style={styles.button} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={'enter-outline'} size={24} color={colors.primary} />
              <Text style={styles.buttonText}>导入</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {playlistData && (
        <Text style={styles.successText}>导入成功! 歌单名称: {playlistData.name}</Text>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    ...defaultStyles.container,
    paddingHorizontal: screenPadding.horizontal,
  },
  buttonContainer: {
    marginTop: 0,
  },
  dismissSymbol: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 1,
  },
  dismissBar: {
    width: 50,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#c7c7cc',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  header: {
    fontSize: 31,
    fontWeight: 'bold',
    padding: 0,
    paddingTop: 5,
    color: colors.text,
  },
  input: {
    height: 44,
    backgroundColor: '#1C1C1F',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#999',
  },
  importButton: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  error: {
    color: '#ff3b30',
    marginTop: 10,
  },
  successText: {
    color: '#34c759',
    marginTop: 10,
  },
  button: {
		padding: 12,
		backgroundColor: 'rgba(47, 47, 47, 0.5)',
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		columnGap: 8,
	},
	buttonText: {
		...defaultStyles.text,
		color: colors.primary,
		fontWeight: '600',
		fontSize: 18,
		textAlign: 'center',
	},
})

export default ImportPlayList