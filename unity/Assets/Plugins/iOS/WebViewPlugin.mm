// Web view integration plug-in for Unity iOS.

#import <Foundation/Foundation.h>

extern UIViewController *UnityGetGLViewController(); // Root view controller of Unity screen.

#pragma mark Plug-in Functions

static UIWebView *webView;

extern "C" void _WebViewPluginInstall() {
    // Add the web view onto the root view (but don't show).
    UIViewController *rootViewController = UnityGetGLViewController();
    webView = [[UIWebView alloc] initWithFrame:rootViewController.view.frame];
    webView.hidden = YES;
    [rootViewController.view addSubview:webView];
}

extern "C" void _WebViewPluginMakeTransparentBackground() {
    [webView setBackgroundColor:[UIColor clearColor]];
    [webView setOpaque:NO];
}

extern "C" void _WebViewPluginLoadUrl(const char* url, boolean isClearCache) {
    if (isClearCache) {
        [[NSURLCache sharedURLCache] removeAllCachedResponses];
    }
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithUTF8String:url]]]];
}

extern "C" void _WebViewPluginSetVisibility(bool visibility) {
    webView.hidden = visibility ? NO : YES;
}

extern "C" void _WebViewPluginSetMargins(int left, int top, int right, int bottom) {
    UIViewController *rootViewController = UnityGetGLViewController();
    
    CGRect frame = rootViewController.view.frame;
    CGFloat scale = rootViewController.view.contentScaleFactor;
    
    CGRect screenBound = [[UIScreen mainScreen] bounds];
    CGSize screenSize = screenBound.size;
    // Obtaining the current device orientation
    UIDeviceOrientation orientation = [[UIDevice currentDevice] orientation];
    
    // landscape
    if (orientation) {
        frame.size.width = screenSize.height - (left + right) / scale;
        frame.size.height = screenSize.width - (top + bottom) / scale;
    } else { // portrait
        frame.size.width = screenSize.width - (left + right) / scale;
        frame.size.height = screenSize.height - (top + bottom) / scale;
    }
    
    frame.origin.x += left / scale;
    frame.origin.y += top / scale;

    webView.frame = frame;
}

extern "C" char *_WebViewPluginPollMessage() {
    // Try to retrieve a message from the message queue in JavaScript context.
    NSString *message = [webView stringByEvaluatingJavaScriptFromString:@"unityWebMediatorInstance.pollMessage()"];
    if (message && message.length > 0) {
        NSLog(@"UnityWebViewPlugin: %@", message);
        char* memory = static_cast<char*>(malloc(strlen(message.UTF8String) + 1));
        if (memory) strcpy(memory, message.UTF8String);
        return memory;
    } else {
        return NULL;
    }
}
