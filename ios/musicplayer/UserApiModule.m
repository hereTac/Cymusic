#import "UserApiModule.h"
#import <React/RCTLog.h>
#import <React/RCTUtils.h>

@interface UserApiModule ()
@property (nonatomic, strong) NSThread *javaScriptThread;
//@property (nonatomic, strong) UtilsEvent *utilsEvent;
@property (nonatomic) NSInteger listenerCount;
@end

@implementation UserApiModule

RCT_EXPORT_MODULE();

- (instancetype)init {
  self = [super init];
  if (self) {
    _javaScriptThread = nil;
//    _utilsEvent = nil;
    _listenerCount = 0;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"UserApiEvent"];
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
  if (_listenerCount == 0) {
    // Set up any upstream listeners or background tasks as necessary
  }

  _listenerCount += 1;
}

RCT_EXPORT_METHOD(removeListeners:(NSInteger)count) {
  _listenerCount -= count;
  if (_listenerCount == 0) {
    // Remove upstream listeners, stop unnecessary background tasks
  }
}

RCT_EXPORT_METHOD(loadScript:(NSDictionary *)data) {
//  if (!_utilsEvent) {
//    _utilsEvent = [[UtilsEvent alloc] initWithReactContext:self.bridge];
//  }
  if (_javaScriptThread) {
    [self destroy];
  }
  // Implement load script logic here
  RCTLogInfo(@"Load script with data: %@", data);
}

RCT_EXPORT_METHOD(sendAction:(NSString *)action info:(NSString *)info resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (_javaScriptThread) {
    // Implement send action logic here
    RCTLogInfo(@"Send action: %@, info: %@", action, info);
    resolve(@YES);
  } else {
    NSError *error = [NSError errorWithDomain:@"UserApiModule" code:500 userInfo:@{ NSLocalizedDescriptionKey: @"JavaScriptThread is not initialized" }];
    reject(@"thread_not_initialized", @"JavaScriptThread is not initialized", error);
  }
}

RCT_EXPORT_METHOD(destroy) {
  if (_javaScriptThread) {
    [_javaScriptThread cancel];
    _javaScriptThread = nil;
  }
}

@end
