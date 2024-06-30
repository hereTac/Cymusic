#import "LyricModule.h"
#import <React/RCTLog.h>
#import <React/RCTUtils.h>

@implementation LyricModule {
  BOOL isShowTranslation;
  BOOL isShowRoma;
  float playbackRate;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
  self = [super init];
  if (self) {
    isShowTranslation = NO;
    isShowRoma = NO;
    playbackRate = 1.0;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"LyricEvent"];
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
  // Set up any upstream listeners or background tasks as necessary
}

RCT_EXPORT_METHOD(removeListeners:(NSInteger)count) {
  // Remove upstream listeners, stop unnecessary background tasks
}

RCT_EXPORT_METHOD(showLyric:(NSDictionary *)data resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement show lyric logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(hideLyric:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement hide lyric logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setLyric:(NSString *)lyric translation:(NSString *)translation romaLyric:(NSString *)romaLyric resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set lyric logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setPlaybackRate:(float)rate resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  playbackRate = rate;
  // Implement set playback rate logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(toggleTranslation:(BOOL)showTranslation resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  isShowTranslation = showTranslation;
  // Implement toggle translation logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(toggleRoma:(BOOL)showRoma resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  isShowRoma = showRoma;
  // Implement toggle roma logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(play:(NSInteger)time resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement play logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(pause:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement pause logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(toggleLock:(BOOL)isLock resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement toggle lock logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setColor:(NSString *)unplayColor playedColor:(NSString *)playedColor shadowColor:(NSString *)shadowColor resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set color logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setAlpha:(float)alpha resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set alpha logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setTextSize:(float)size resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set text size logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setMaxLineNum:(NSInteger)maxLineNum resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set max line number logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setSingleLine:(BOOL)singleLine resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set single line logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setShowToggleAnima:(BOOL)showToggleAnima resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set show toggle animation logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setWidth:(NSInteger)width resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set width logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(setLyricTextPosition:(NSString *)positionX positionY:(NSString *)positionY resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // Implement set lyric text position logic here
  resolve(nil);
}

RCT_EXPORT_METHOD(checkOverlayPermission:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (@available(iOS 13.0, *)) {
    if (![UIApplication.sharedApplication.keyWindow.rootViewController isKindOfClass:[UIAlertController class]]) {
      resolve(nil);
    } else {
      reject(@"permission_denied", @"Permission denied", nil);
    }
  } else {
    resolve(nil);
  }
}

RCT_EXPORT_METHOD(openOverlayPermissionActivity:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (@available(iOS 13.0, *)) {
    if (![UIApplication.sharedApplication.keyWindow.rootViewController isKindOfClass:[UIAlertController class]]) {
      UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Overlay Permission"
                                                                     message:@"Please enable overlay permission in Settings."
                                                              preferredStyle:UIAlertControllerStyleAlert];

      UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"OK"
                                                         style:UIAlertActionStyleDefault
                                                       handler:^(UIAlertAction * _Nonnull action) {
        NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
        if ([[UIApplication sharedApplication] canOpenURL:url]) {
          [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
        }
        resolve(nil);
      }];

      [alert addAction:okAction];
      [UIApplication.sharedApplication.keyWindow.rootViewController presentViewController:alert animated:YES completion:nil];
    } else {
      resolve(nil);
    }
  } else {
    resolve(nil);
  }
}

@end
