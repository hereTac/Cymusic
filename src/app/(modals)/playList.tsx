import React, { useEffect, useState } from 'react';
import { colors, screenPadding } from '@/constants/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { defaultStyles } from '@/styles';
import { useHeaderHeight } from '@react-navigation/elements';
import { Track, useActiveTrack } from 'react-native-track-player';
import myTrackPlayer from '@/helpers/trackPlayerIndex';
import { usePlayerBackground } from '@/hooks/usePlayerBackground';
import { unknownTrackImageUri } from '@/constants/images';
import { NowPlayList } from '@/components/NowPlayList';
import { usePlayList } from '@/store/playList'

const PlayListScreen = () => {
  const headerHeight = useHeaderHeight();
  const tracks = usePlayList();


  return (
    <SafeAreaView style={[styles.modalContainer, { paddingTop: headerHeight }]}>
      <NowPlayList id='PlayListScreen' tracks={tracks as Track[]} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal,
    backgroundColor: defaultStyles.container.backgroundColor, // 设置默认背景颜色
  },
});

export default PlayListScreen;
