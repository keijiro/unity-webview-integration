#pragma strict

// WebView との仲介を行うスクリプト。

import System.Runtime.InteropServices;

// メッセージクラス
class WebMediatorMessage {
    var path : String;          // メッセージパス
    var params : Hashtable;     // 引数テーブル

    // コンストラクタの定義
    function WebMediatorMessage(rawMessage : String) {
        // パス部分を抽出。
        var split = rawMessage.Split("?"[0]);
        path = split[0];
        // パラメーター部分の分解。
        params = new Hashtable();
        if (split.Length > 1) {
            for (var pair in split[1].Split("&"[0])) {
                var elems = pair.Split("="[0]);
                params[elems[0]] = elems[1];
            }
        }
    }
}

#if UNITY_EDITOR

// Unity エディター用ダミー実装

static function Install(url : String) {
}

static function PollMessage() : WebMediatorMessage {
    return null;
}

#elif UNITY_ANDROID

// Android 用実装

private static var injector : AndroidJavaClass;

static function Install(url : String) {
    injector = AndroidJavaClass("jp.radiumsoftware.unity.plugin.webmediator.WebViewInjector");
    injector.CallStatic("install", url);
}

static function PollMessage() : WebMediatorMessage {
    var message = injector.CallStatic.<String>("pollMessage");
    return message ? new WebMediatorMessage(message) : null;
}

#elif UNITY_IPHONE

// iPhone 用実装

@DllImportAttribute("__Internal") static private function _WebViewInjectorInstall(url : String) {}
@DllImportAttribute("__Internal") static private function _WebViewInjectorPollMessage() : String {}

static function Install(url : String) {
    _WebViewInjectorInstall(url);
}

static function PollMessage() : WebMediatorMessage {
    var message = _WebViewInjectorPollMessage();
    return message ? new WebMediatorMessage(message) : null;
}

#endif
