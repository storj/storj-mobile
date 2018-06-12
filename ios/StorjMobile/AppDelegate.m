/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "STFileManager.h"
#import "PrepareSyncService.h"
#import "SyncService.h"
#import "SyncEntryState.h"
#import "PermissionManager.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
  
  [self requestPermissions];
  
  //debug
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  
  //Release
  //jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"Storj"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
//
  
  return YES;
}

-(void) requestPermissions
{
  
  PermissionManager *permissionManager = [[PermissionManager  alloc] init];
  
  if([permissionManager isAllPermissionsGranted])
  {
    [self prepareSync];
    
    return;
  }

  [permissionManager requestAllPermissionsWithCompletion:^{
    if(![permissionManager isAllPermissionsGranted])
    {
      [[[UIAlertView alloc] initWithTitle: @"Attention"
                                  message: @"You have refused permissions. Please enable them in Settings."
                                 delegate: self
                        cancelButtonTitle: @"OK"
                        otherButtonTitles: nil] show];
    } else
    {
      [self prepareSync];
    }
  }];

}

-(void) prepareSync
{
  NSArray *array = [[[PrepareSyncService alloc] init] prepareSyncQueue];
  NSLog(@"SyncQueue: %@", array);
  
  //  [[[SyncService alloc] init] startSync];
}

@end
