// src/app/modals/settingModal.tsx
import React, { useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Image, Modal, Linking } from 'react-native'
import { colors } from '@/constants/tokens'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { utilsStyles } from '@/styles'
import { MenuView } from '@react-native-menu/menu'
const QUALITY_OPTIONS = ['128k', '320k', 'flac']
// eslint-disable-next-line react/prop-types
const MusicQualityMenu = ({ currentQuality, onSelectQuality }) => {
  const handlePressAction = async (id: string) => {
    if (QUALITY_OPTIONS.includes(id)) {
      onSelectQuality(id)
    }
  }

  return (
    <MenuView
      onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
      actions={QUALITY_OPTIONS.map(quality => ({
        id: quality,
        title: quality,
        state: currentQuality === quality ? 'on' : 'off',
      }))}
    >
      <TouchableOpacity style={styles.menuTrigger}>
        <Text style={styles.menuTriggerText}>{currentQuality}</Text>
      </TouchableOpacity>
    </MenuView>
  )
}
const settingsData = [
  {
    title: '应用信息',
    data: [
      { id: '1', title: 'music-player', type: 'link', icon: require('@/assets/144.png') },
      { id: '2', title: '版本号', type: 'value', value: '1.0.1' },
      { id: '3', title: '检查更新', type: 'link' },
      { id: '5', title: '项目链接', type: 'value', value: '' },
    ]
  },
  {
    title: '音频设置',
    data: [
      { id: '6', title: '清空待播清单', type: 'link' },
    ]
  },
  {
    title: '自定义音源',
    data: [
      { id: '7', title: '音源状态', type: 'value', value: '正常' },
      { id: '8', title: '导入音源', type: 'link' },
    ]
  },
  {
    title: '音质选择',
    data: [
      { id: '10', title: '当前音质', type: 'value' },
    ]
  },
]

const SettingModal = () => {
  const router = useRouter()
  const [currentQuality, setCurrentQuality] = useState('320k')
  const [isQualitySelectorVisible, setIsQualitySelectorVisible] = useState(false)

  const DismissPlayerSymbol = () => {
    const { top } = useSafeAreaInsets();
    return (
      <View style={[styles.dismissSymbol, { top: top - 25 }]}>
        <View style={styles.dismissBar} />
      </View>
    );
  };

  const renderItem = (item, index, sectionData) => (
    <View key={item.id}>
    <TouchableOpacity
       key={item.id}
      style={[
        styles.item,
        index === 0 && styles.firstItem,
        index === sectionData.length - 1 && styles.lastItem
      ]}
      onPress={() => {
        if (item.title === '项目链接') {
          Linking.openURL('https://github.com/gyc-12/music-player-master')
            .catch(err => console.error("Couldn't load page", err));
        } else if (item.title === '当前音质') {
          setIsQualitySelectorVisible(true)
        } else if (item.type === 'link') {
          console.log(`Navigate to ${item.title}`)
        }
      }}
    >
      {item.icon && <Image source={item.icon} style={styles.icon} />}
      <View style={styles.itemContent}>
        <Text style={styles.itemText}>{item.title}</Text>
        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={(newValue) => {
              console.log(`${item.title} switched to ${newValue}`)
            }}
          />
        )}
        {item.type === 'value' && (
          <Text style={styles.itemValue}>{item.value}</Text>
        )}
        {item.title === '当前音质' && (
         <MusicQualityMenu
            currentQuality={currentQuality}
            onSelectQuality={setCurrentQuality}
          />
        )}
        {(item.type === 'link' || item.title === '项目链接' ) && !item.icon && (
          <Text style={styles.arrowRight}>{'>'}</Text>
        )}


      </View>

    </TouchableOpacity>
    {index !== sectionData.length - 1 && <View style={styles.separator} />}
    </View>
  )

  return (
    <View style={styles.container}>
      <DismissPlayerSymbol />
      <Text style={styles.header}>设置</Text>
      <ScrollView style={styles.scrollView}>
        {settingsData.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.data.map(renderItem)}
            </View>
          </View>
        ))}
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    height: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    opacity: 0.7,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    padding: 20,
    paddingTop: 50,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 20,
    marginBottom: 5,
  },
item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    // 移除 borderBottomWidth 和 borderBottomColor
  },
   firstItem: {
     borderBottomWidth: 0,
  },
  lastItem: {
    borderBottomWidth: 0, // 确保最后一项没有底部边框
  },
  separator: {
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: colors.maximumTrackTintColor,
  },
  sectionContent: {
    backgroundColor: 'rgb(32,32,32)',
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: 'hidden', // 确保圆角不被分隔线覆盖
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
		borderRadius:6
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: colors.text,
  },
  itemValue: {
    fontSize: 16,
    color: colors.textMuted,
  },
  arrowRight: {
    fontSize: 18,
    color: colors.textMuted,
  },
    menuTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTriggerText: {
     fontSize: 16,
    color: colors.textMuted,

  },
})

export default SettingModal
