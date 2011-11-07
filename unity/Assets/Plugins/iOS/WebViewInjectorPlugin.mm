// Unity 画面に対する WebView の組み込みと、メッセージのやりとりを担当するプラグイン。

#import <Foundation/Foundation.h>

// Root view controller of Unity screen
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

// URL リクエストの処理。スキームが "unity" である場合にトラップする。
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    if ([request.URL.scheme isEqualToString:@"unity"]) {
        NSLog(@"WebViewDelegate - %@", request.URL);
        if (request.URL.query) {
            // "path?query" の形式に直して保存。
            NSMutableString *message = [NSMutableString stringWithCapacity:1024];
            [message setString:request.URL.path];
            [message appendString:@"?"];
            [message appendString:request.URL.query];
            [messageQueue_ addObject:message];
        } else {
            [messageQueue_ addObject:request.URL.path];
        }
        return NO;
    } else {
        return YES;
    }
}

// メッセージをキューから引き出す。
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

// 組み込まれる WebView
static UIWebView *webView;

// WebView のデリゲート兼メッセージキュー
static WebViewDelegate *webViewDelegate;

// WebView の組み込み
extern "C" void _WebViewInjectorInstall(const char *url) {
    // Unity 画面のルートビューを取得する。
    UIViewController *rootViewController = UnityGetGLViewController();
    // 画面下半分を組み込み領域とする。
    CGRect frame = rootViewController.view.frame;
    frame.size.height /= 2;
    frame.origin.y += frame.size.height;
    // WebView を生成しつつデリゲートを組み込む。
    webView = [[UIWebView alloc] initWithFrame:frame];
    webViewDelegate = [[WebViewDelegate alloc] init];
    webView.delegate = webViewDelegate;
    // Unity 画面のルートビューに WebView を組み込む。
    [rootViewController.view addSubview:webView];
    // 指定 URL をロード開始する。
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithUTF8String:url]]]];
}

// メッセージの引き出し
extern "C" char *_WebViewInjectorPollMessage() {
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
