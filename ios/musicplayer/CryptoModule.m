#import "CryptoModule.h"
#import <CommonCrypto/CommonCrypto.h>
#import <React/RCTLog.h>

@implementation CryptoModule


+ (NSData *)base64Decode:(NSString *)string {
    return [[NSData alloc] initWithBase64EncodedString:string options:0];
}

+ (NSString *)base64Encode:(NSData *)data {
    return [data base64EncodedStringWithOptions:0];
}

+ (NSString *)encrypt:(NSString *)data key:(NSString *)key iv:(NSString *)iv mode:(NSString *)mode {
    NSData *dataToEncrypt = [self base64Decode:data];
    NSData *keyData = [self base64Decode:key];
    NSData *ivData = [self base64Decode:iv];

    CCCryptorRef cryptor = NULL;
    CCCryptorStatus status = CCCryptorCreateWithMode(kCCEncrypt, kCCModeCBC, kCCAlgorithmAES, ccPKCS7Padding, ivData.bytes, keyData.bytes, keyData.length, NULL, 0, 0, 0, &cryptor);

    if (status != kCCSuccess) {
        return nil;
    }

    size_t bufferSize = CCCryptorGetOutputLength(cryptor, dataToEncrypt.length, true);
    void *buffer = malloc(bufferSize);
    size_t numBytesEncrypted = 0;

    status = CCCryptorUpdate(cryptor, dataToEncrypt.bytes, dataToEncrypt.length, buffer, bufferSize, &numBytesEncrypted);

    if (status != kCCSuccess) {
        free(buffer);
        CCCryptorRelease(cryptor);
        return nil;
    }

    size_t numBytesFinalEncrypted = 0;
    status = CCCryptorFinal(cryptor, buffer + numBytesEncrypted, bufferSize - numBytesEncrypted, &numBytesFinalEncrypted);

    if (status != kCCSuccess) {
        free(buffer);
        CCCryptorRelease(cryptor);
        return nil;
    }

    NSData *encryptedData = [NSData dataWithBytesNoCopy:buffer length:(numBytesEncrypted + numBytesFinalEncrypted)];
    CCCryptorRelease(cryptor);

    return [self base64Encode:encryptedData];
}

+ (NSString *)decrypt:(NSString *)data key:(NSString *)key iv:(NSString *)iv mode:(NSString *)mode {
    NSData *dataToDecrypt = [self base64Decode:data];
    NSData *keyData = [self base64Decode:key];
    NSData *ivData = [self base64Decode:iv];

    CCCryptorRef cryptor = NULL;
    CCCryptorStatus status = CCCryptorCreateWithMode(kCCDecrypt, kCCModeCBC, kCCAlgorithmAES, ccPKCS7Padding, ivData.bytes, keyData.bytes, keyData.length, NULL, 0, 0, 0, &cryptor);

    if (status != kCCSuccess) {
        return nil;
    }

    size_t bufferSize = CCCryptorGetOutputLength(cryptor, dataToDecrypt.length, true);
    void *buffer = malloc(bufferSize);
    size_t numBytesDecrypted = 0;

    status = CCCryptorUpdate(cryptor, dataToDecrypt.bytes, dataToDecrypt.length, buffer, bufferSize, &numBytesDecrypted);

    if (status != kCCSuccess) {
        free(buffer);
        CCCryptorRelease(cryptor);
        return nil;
    }

    size_t numBytesFinalDecrypted = 0;
    status = CCCryptorFinal(cryptor, buffer + numBytesDecrypted, bufferSize - numBytesDecrypted, &numBytesFinalDecrypted);

    if (status != kCCSuccess) {
        free(buffer);
        CCCryptorRelease(cryptor);
        return nil;
    }

    NSData *decryptedData = [NSData dataWithBytesNoCopy:buffer length:(numBytesDecrypted + numBytesFinalDecrypted)];
    CCCryptorRelease(cryptor);

    return [[NSString alloc] initWithData:decryptedData encoding:NSUTF8StringEncoding];
}

@end


@end
