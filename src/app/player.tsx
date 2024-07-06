import React, { useEffect } from 'react';
import { MovingText } from '@/components/MovingText';
import { PlayerControls } from '@/components/PlayerControls';
import { PlayerProgressBar } from '@/components/PlayerProgressbar';
import { PlayerRepeatToggle } from '@/components/PlayerRepeatToggle';
import { PlayerVolumeBar } from '@/components/PlayerVolumeBar';
import { unknownTrackImageUri } from '@/constants/images';
import { colors, fontSize, screenPadding } from '@/constants/tokens';
import { usePlayerBackground } from '@/hooks/usePlayerBackground';
import { useTrackPlayerFavorite } from '@/hooks/useTrackPlayerFavorite';
import { defaultStyles, utilsStyles } from '@/styles';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveTrack } from 'react-native-track-player';
import usePlayerStore from '@/store/usePlayerStore';

const PlayerScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useTrackPlayerFavorite();

  const {
    isLoading,
    isInitialized,
    prevTrack,
    activeTrack,
    setLoading,
    setInitialized,
    setPrevTrack,
    setActiveTrack,
  } = usePlayerStore();

  const currentActiveTrack = useActiveTrack();
  const { imageColors } = usePlayerBackground(currentActiveTrack?.artwork ?? unknownTrackImageUri);

  useEffect(() => {

    const checkTrackLoading = async () => {
      if (!isInitialized) {
        setInitialized(true);
        setActiveTrack(currentActiveTrack);
        setPrevTrack(currentActiveTrack);
      } else if (!currentActiveTrack && !prevTrack) {
         // console.log('prevTrack new ', prevTrack);
        setLoading(true);
      } else if (currentActiveTrack && currentActiveTrack.id !== prevTrack.id) {
            console.log('prevTrack 12312new ');
        setLoading(true);
        // Simulate a delay to ensure track is fully loaded
        await new Promise((resolve) => setTimeout(resolve, 50));
        setLoading(false);
        setPrevTrack(currentActiveTrack); // Update previous track when the new track is fully loaded
      }
      setActiveTrack(currentActiveTrack);
    };
    if (currentActiveTrack !== undefined) {
      console.log('currentActiveTrack new :::::', currentActiveTrack);
      checkTrackLoading();
    }
  }, [currentActiveTrack]);

  const trackToDisplay = activeTrack || prevTrack; // Use previous track if active track is null

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={imageColors ? [imageColors.background, imageColors.primary] : [colors.background]}
    >
      <View style={styles.overlayContainer}>
        <DismissPlayerSymbol />

        <View style={{ flex: 1, marginTop: top + 70, marginBottom: bottom }}>
          <View style={styles.artworkImageContainer}>
            <FastImage
              source={{
                uri: trackToDisplay?.artwork ?? unknownTrackImageUri,
                priority: FastImage.priority.high,
              }}
              resizeMode="cover"
              style={styles.artworkImage}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ marginTop: 'auto' }}>
              <View style={{ height: 60 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {/* Track title */}
                  <View style={styles.trackTitleContainer}>
                    <MovingText
                      text={trackToDisplay?.title ?? ''}
                      animationThreshold={30}
                      style={styles.trackTitleText}
                    />
                  </View>

                  {/* Favorite button icon */}
                  <FontAwesome
                    name={isFavorite ? 'heart' : 'heart-o'}
                    size={20}
                    color={isFavorite ? colors.primary : colors.icon}
                    style={{ marginHorizontal: 14 }}
                    onPress={toggleFavorite}
                  />
                </View>

                {/* Track artist */}
                {trackToDisplay?.artist && (
                  <Text numberOfLines={1} style={[styles.trackArtistText, { marginTop: 6 }]}>
                    {trackToDisplay.artist}
                  </Text>
                )}
              </View>

              <PlayerProgressBar style={{ marginTop: 32 }} />

              <PlayerControls style={{ marginTop: 40 }} />
            </View>

            <PlayerVolumeBar style={{ marginTop: 'auto', marginBottom: 30 }} />

            <View style={utilsStyles.centeredRow}>
              <PlayerRepeatToggle size={30} style={{ marginBottom: 6 }} />
            </View>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const DismissPlayerSymbol = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        top: top + 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <View
        accessible={false}
        style={{
          width: 50,
          height: 8,
          borderRadius: 8,
          backgroundColor: '#fff',
          opacity: 0.7,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...defaultStyles.container,
    paddingHorizontal: screenPadding.horizontal,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  artworkImageContainer: {
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 11.0,
    flexDirection: 'row',
    justifyContent: 'center',
    height: '45%',
    borderRadius: 12,
    backgroundColor: '#9ca3af',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  trackTitleContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  trackTitleText: {
    ...defaultStyles.text,
    fontSize: 22,
    fontWeight: '700',
  },
  trackArtistText: {
    ...defaultStyles.text,
    fontSize: fontSize.base,
    opacity: 0.8,
    maxWidth: '90%',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background to indicate loading
  },
});

export default PlayerScreen;
