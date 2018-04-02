//
//  BucketModel.h
//  StorjMobile
//
//  Created by Barterio on 3/19/18.
//  Copyright © 2018 Storj. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "IConvertibleToJS.h"
#import "DictionaryUtils.h"
#import "StorjLibIos.h"
#import "BucketContract.h"
//#import "storj.h"
@import StorjIOS;

@interface BucketModel : NSObject<IConvertibleToJS>

@property (nonatomic, strong) NSString * _id;
@property (nonatomic, strong) NSString * _name;
@property (nonatomic, strong) NSString * _created;
@property long _hash;
@property BOOL _isDecrypted;
@property BOOL _isStarred;

-(instancetype) initWithStorjBucketModel: (SJBucket *) sjBucket;

-(instancetype) initWithId: (NSString *) bucketId
                      name: (NSString *) bucketName
                   created: (NSString *) created
                      hash: (long) hash
               isDecrypted: (BOOL) isDecrypted;

-(instancetype) initWithId: (NSString *) bucketId
                      name: (NSString *) bucketName
                   created: (NSString *) created
                      hash: (long) hash
               isDecrypted: (BOOL) isDecrypted
                 isStarred: (BOOL) isStarred;

-(BOOL) isValid;

@end
