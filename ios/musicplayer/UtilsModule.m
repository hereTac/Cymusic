//
//  UtilsModule.m
//  LxMusicMobile
//
//  Created by gyc on 2024/6/25.
//

#import <Foundation/Foundation.h>
#import "UtilsModule.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import <UIKit/UIKit.h>

@implementation UtilsModule

RCT_EXPORT_MODULE();

// 添加监听器和移除监听器方法
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
  // 此处实现具体的监听逻辑
}

RCT_EXPORT_METHOD(removeListeners:(NSInteger)count) {
  // 此处实现具体的移除监听逻辑
}

// 获取支持的ABI
RCT_REMAP_METHOD(getSupportedAbis, getSupportedAbisWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSArray *supportedAbis = @[[[UIDevice currentDevice] model]];
  resolve(supportedAbis);
}

// 获取设备名称
RCT_REMAP_METHOD(getDeviceName, getDeviceNameWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *deviceName = [UIDevice currentDevice].name;
  resolve(deviceName);
}

// 获取WIFI IPv4地址
RCT_EXPORT_METHOD(getWIFIIPV4Address:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  // 在iOS中，获取IP地址需要更加复杂的操作，这里简化处理返回一个占位符
  resolve(@"0.0.0.0");
}

// 安装APK方法在iOS上不可用，所以这里只是一个占位符
RCT_EXPORT_METHOD(installApk:(NSString *)filePath fileProviderAuthority:(NSString *)fileProviderAuthority resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  reject(@"not_supported", @"installApk is not supported on iOS", nil);
}

// 退出应用
RCT_EXPORT_METHOD(exitApp) {
  exit(0);
}

// 保持屏幕唤醒
RCT_EXPORT_METHOD(screenkeepAwake) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
  });
}

// 取消保持屏幕唤醒
RCT_EXPORT_METHOD(screenUnkeepAwake) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
  });
}

// 检查通知是否启用
RCT_REMAP_METHOD(isNotificationsEnabled, isNotificationsEnabledWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  UIUserNotificationSettings *settings = [[UIApplication sharedApplication] currentUserNotificationSettings];
  BOOL enabled = settings.types != UIUserNotificationTypeNone;
  resolve(@(enabled));
}

// 打开通知权限设置页面
RCT_REMAP_METHOD(openNotificationPermissionActivity, openNotificationPermissionActivityWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (@available(iOS 10.0, *)) {
    NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
    if ([[UIApplication sharedApplication] canOpenURL:url]) {
      [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:^(BOOL success) {
        resolve(@(success));
      }];
    } else {
      resolve(@(NO));
    }
  } else {
    resolve(@(NO));
  }
}

// 分享文本
RCT_EXPORT_METHOD(shareText:(NSString *)shareTitle title:(NSString *)title text:(NSString *)text) {
  dispatch_async(dispatch_get_main_queue(), ^{
    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:@[title, text] applicationActivities:nil];
    UIViewController *rootVC = [UIApplication sharedApplication].delegate.window.rootViewController;
    [rootVC presentViewController:activityVC animated:YES completion:nil];
  });
}

// 获取系统语言
RCT_REMAP_METHOD(getSystemLocales, getSystemLocalesWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLocale *locale = [NSLocale currentLocale];
  NSString *localeIdentifier = [locale localeIdentifier];
  resolve(localeIdentifier);
}

// 获取窗口尺寸
RCT_REMAP_METHOD(getWindowSize, getWindowSizeWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  CGRect screenRect = [[UIScreen mainScreen] bounds];
  CGFloat width = CGRectGetWidth(screenRect);
  CGFloat height = CGRectGetHeight(screenRect);
  NSDictionary *sizeDict = @{@"width": @(width), @"height": @(height)};
  resolve(sizeDict);
}

// 检查是否忽略电池优化
RCT_REMAP_METHOD(isIgnoringBatteryOptimization, isIgnoringBatteryOptimizationWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  resolve(@(NO));
}

// 请求忽略电池优化
RCT_REMAP_METHOD(requestIgnoreBatteryOptimization, requestIgnoreBatteryOptimizationWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  resolve(@(NO));
}

@end
