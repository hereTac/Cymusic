#import "MusicMetadata.h"
#import <AVFoundation/AVFoundation.h>

@implementation MusicMetadata

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getMetadata:(NSArray *)uris resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSMutableArray *songArray = [NSMutableArray array];
        NSFileManager *fileManager = [NSFileManager defaultManager];
        
        for (NSString *uri in uris) {
            @autoreleasepool {
                NSError *error;
                NSURL *originalURL = [NSURL URLWithString:uri];
                NSURL *tempDirURL = [NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES];
                NSURL *tempFileURL = [tempDirURL URLByAppendingPathComponent:[originalURL lastPathComponent]];
                
                // 复制文件到临时目录
                if ([fileManager copyItemAtURL:originalURL toURL:tempFileURL error:&error]) {
                    NSDictionary *songDictionary = [self getDataFromURL:tempFileURL];
                    if (songDictionary) {
                        [songArray addObject:songDictionary];
                    } else {
                        NSLog(@"解析元数据时出错: %@", error);
                    }
                    
                    // 删除临时文件
                    [fileManager removeItemAtURL:tempFileURL error:nil];
                } else {
                    NSLog(@"复制文件失败: %@", error);
                }
            }
        }
        
        if (songArray.count > 0) {
            dispatch_async(dispatch_get_main_queue(), ^{
                resolve(songArray);
            });
        } else {
            NSError *error = [NSError errorWithDomain:@"MusicMetadata" code:500 userInfo:@{NSLocalizedDescriptionKey: @"未能获取到元数据"}];
            dispatch_async(dispatch_get_main_queue(), ^{
                reject(@"no_data", @"未能获取到元数据", error);
            });
        }
    });
}

- (NSDictionary *)getDataFromURL:(NSURL *)fileURL
{
    NSMutableDictionary *songDictionary = [NSMutableDictionary dictionary];
    
    @try {
        AVAsset *asset = [AVURLAsset URLAssetWithURL:fileURL options:nil];
        
        for (NSString *format in [asset availableMetadataFormats]) {
            for (AVMetadataItem *item in [asset metadataForFormat:format]) {
                NSString *key = item.commonKey ?: item.key;
                id value = item.value;
                
                if ([key isEqualToString:AVMetadataCommonKeyTitle]) {
                    songDictionary[@"title"] = value;
                } else if ([key isEqualToString:AVMetadataCommonKeyArtist]) {
                    songDictionary[@"artist"] = value;
                } else if ([key isEqualToString:AVMetadataCommonKeyAlbumName]) {
                    songDictionary[@"albumName"] = value;
                } else if ([key isEqualToString:AVMetadataCommonKeyArtwork]) {
                    if ([value isKindOfClass:[NSData class]]) {
                        NSString *base64String = [(NSData *)value base64EncodedStringWithOptions:0];
                        songDictionary[@"artwork"] = base64String;
                    }
                }
            }
        }
        
        // 获取音频时长
        CMTime duration = asset.duration;
        float durationInSeconds = CMTimeGetSeconds(duration);
        songDictionary[@"duration"] = @(durationInSeconds);
        
        // 添加 URI
        songDictionary[@"uri"] = fileURL.absoluteString;
        
        return [songDictionary copy];
    } @catch (NSException *exception) {
        NSLog(@"解析元数据时出错: %@", exception.reason);
        return nil;
    }
}

@end