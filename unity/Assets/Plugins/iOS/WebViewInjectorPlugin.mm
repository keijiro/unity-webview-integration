#import <Foundation/Foundation.h>

// Root view controller of Unity screen.
extern UIViewController *UnityGetGLViewController();

#pragma mark UIWebViewDelegate

@interface WebViewDelegate : NSObject <UIWebViewDelegate> {
    NSMutableArray *messageQueue_;
}

- (NSString *)popMessage;

@end

@implementation WebViewDelegate

- (id)init {
    if (self = [super init]) {
        messageQueue_ = [[NSMutableArray alloc] initWithCapacity:16];
    }
    return self;
}

- (void)dealloc {
    [messageQueue_ release];
    [super dealloc];
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    if ([request.URL.scheme isEqualToString:@"callback"]) {
        [messageQueue_ addObject:request.URL.path];
        NSLog(@"path - %@", request.URL.path);
        NSLog(@"parameterString - %@", request.URL.parameterString);
        return NO;
    } else {
        return YES;
    }
}

- (NSString *)popMessage {
    if (messageQueue_.count > 0) {
        NSString *message = [[[messageQueue_ objectAtIndex:0] retain] autorelease];
        [messageQueue_ removeObjectAtIndex:0];
        return message;
    } else {
        return nil;
    }
}

@end

#pragma mark Plug-in Function

static UIWebView *webView;
static WebViewDelegate *webViewDelegate;

extern "C" void _WebViewInjectorInstall(const char *url) {
    UIViewController *rootViewController = UnityGetGLViewController();
    
    CGRect frame = rootViewController.view.frame;
    
    frame.size.height /= 2;
    frame.origin.y += frame.size.height;
    
    webView = [[UIWebView alloc] initWithFrame:frame];
    webViewDelegate = [[WebViewDelegate alloc] init];
    webView.delegate = webViewDelegate;
    
    [rootViewController.view addSubview:webView];
    
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithUTF8String:url]]]];
}

extern "C" char *_WebViewInjectorPopMessage() {
    NSString *message = [webViewDelegate popMessage];
    if (message) {
        char* memory = static_cast<char*>(malloc(strlen(message.UTF8String) + 1));
        if (memory) strcpy(memory, message.UTF8String);
        return memory;
    } else {
        return NULL;
    }
}
