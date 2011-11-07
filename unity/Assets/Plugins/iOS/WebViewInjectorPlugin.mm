#import <Foundation/Foundation.h>

// Root view controller of Unity screen.
extern UIViewController *UnityGetGLViewController();

static UIWebView *webView;

#pragma mark Plug-in Function

extern "C" void _WebViewInjectorInstall(const char *url) {
    UIViewController *rootViewController = UnityGetGLViewController();
    
    CGRect frame = rootViewController.view.frame;
    
    frame.size.height /= 2;
    frame.origin.y += frame.size.height;
    
    webView = [[UIWebView alloc] initWithFrame:frame];
    [rootViewController.view addSubview:webView];

    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithUTF8String:url]]]];
}

extern "C" char *_WebViewInjectorPopMessage() {
    return NULL;
}
