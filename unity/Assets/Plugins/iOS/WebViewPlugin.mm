// WebView integration plug-in for Unity iOS.

#import <Foundation/Foundation.h>

// Root view controller of Unity screen.
extern UIViewController *UnityGetGLViewController();

#pragma mark UIWebViewDelegate implementation

@interface WebViewDelegate : NSObject <UIWebViewDelegate> {
    NSMutableArray *messageQueue_;
}
- (NSString *)pollMessage;
@end

@implementation WebViewDelegate

- (id)init {
    if ((self = [super init])) {
        messageQueue_ = [[NSMutableArray alloc] initWithCapacity:16];
    }
    return self;
}

- (void)dealloc {
    [messageQueue_ release];
    [super dealloc];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
}

- (void)webViewDidFinishLoad:(UIWebView *)webView {
}

- (void)webViewDidStartLoad:(UIWebView *)webView {
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    // Trap if the scheme is "unity".
    if ([request.URL.scheme isEqualToString:@"unity"]) {
        NSLog(@"WebViewDelegate - %@", request.URL);
        if (request.URL.query) {
            // Convert the request into "path?query" form and store it.
            NSMutableString *message = [NSMutableString stringWithCapacity:1024];
            [message setString:request.URL.path];
            [message appendString:@"?"];
            [message appendString:request.URL.query];
            [messageQueue_ addObject:message];
        } else {
            // There is no query. Path only.
            [messageQueue_ addObject:request.URL.path];
        }
        // This request is to be discarded.
        return NO;
    } else {
        return YES;
    }
}

- (NSString *)pollMessage {
    if (messageQueue_.count > 0) {
        NSString *message = [[[messageQueue_ objectAtIndex:0] retain] autorelease];
        [messageQueue_ removeObjectAtIndex:0];
        return message;
    } else {
        return nil;
    }
}

@end

#pragma mark Plug-in Functions

static UIWebView *webView;
static WebViewDelegate *webViewDelegate;

extern "C" void _WebViewPluginInstall() {
    // Unity 画面のルートビューを取得する。
    UIViewController *rootViewController = UnityGetGLViewController();
    // WebView を生成しつつデリゲートを組み込む。
    webView = [[UIWebView alloc] initWithFrame:rootViewController.view.frame];
    webViewDelegate = [[WebViewDelegate alloc] init];
    webView.delegate = webViewDelegate;
    webView.hidden = YES;
    // Unity 画面のルートビューに WebView を組み込む。
    [rootViewController.view addSubview:webView];
}

extern "C" void _WebViewPluginLoadUrl(const char* url) {
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithUTF8String:url]]]];
}

extern "C" void _WebViewPluginSetVisibility(bool visibility) {
    webView.hidden = visibility ? NO : YES;
}

extern "C" void _WebViewPluginSetMargins(int left, int top, int right, int bottom) {
    UIViewController *rootViewController = UnityGetGLViewController();
    CGRect frame = rootViewController.view.frame;
    CGFloat scale = rootViewController.view.contentScaleFactor;
    
    frame.size.width -= (left + right) / scale;
    frame.size.height -= (top + bottom) / scale;
    
    frame.origin.x += left / scale;
    frame.origin.y += top / scale;
    
    webView.frame = frame;
}

// メッセージの引き出し
extern "C" char *_WebViewPluginPollMessage() {
    NSString *message = [webViewDelegate pollMessage];
    if (message) {
        // Unity 文字列オブジェクトとしてメッセージを返す。
        char* memory = static_cast<char*>(malloc(strlen(message.UTF8String) + 1));
        if (memory) strcpy(memory, message.UTF8String);
        return memory;
    } else {
        return NULL;
    }
}
