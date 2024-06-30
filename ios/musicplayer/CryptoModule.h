#import <React/RCTBridgeModule.h>

@interface CryptoModule : NSObject <RCTBridgeModule>

+ (NSString *)encrypt:(NSString *)data key:(NSString *)key iv:(NSString *)iv mode:(NSString *)mode;
+ (NSString *)decrypt:(NSString *)data key:(NSString *)key iv:(NSString *)iv mode:(NSString *)mode;

@end
