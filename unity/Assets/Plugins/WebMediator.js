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

// 唯一のインスタンス
private static var instance : WebMediator;

private var lastRequestedUrl : String;  // 最近リクエストされた URL
private var loadRequest : boolean;      // 読み込みリクエストフラグ

// WebView のインストール
static function Install(initialUrl : String) {
    if (instance == null) {
        // 更新用ゲームオブジェクトを作る。
        instance = (new GameObject()).AddComponent.<WebMediator>();
        // 初期 URL を設定する。
        instance.lastRequestedUrl = initialUrl;
        // プラットフォーム依存の組み込み。
        InstallPlatform();
    }
}

// 指定 URL のロードをリクエスト
static function LoadUrl(url : String) {
    instance.lastRequestedUrl = url;
    instance.loadRequest = true;
}

function Update() {
    UpdatePlatform();
    instance.loadRequest = false;
}

#if UNITY_EDITOR

// Unity エディター用ダミー実装
private static function InstallPlatform() { }
private static function UpdatePlatform() { }
static function PollMessage() : WebMediatorMessage { return null; }

#elif UNITY_ANDROID

// Android 用実装

private static var unityPlayerClass : AndroidJavaClass;

private static function InstallPlatform() {
    unityPlayerClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
}

private static function UpdatePlatform() {
    var activity = unityPlayerClass.GetStatic.<AndroidJavaObject>("currentActivity");
    activity.Call("update", instance.lastRequestedUrl, instance.loadRequest);
}

static function PollMessage() : WebMediatorMessage {
    var activity = unityPlayerClass.GetStatic.<AndroidJavaObject>("currentActivity");
    var message = activity.Call.<String>("pollMessage");
    return message ? new WebMediatorMessage(message) : null;
}

#elif UNITY_IPHONE

// iPhone 用実装

@DllImportAttribute("__Internal") static private function _WebViewInjectorInstall(url : String) {}
@DllImportAttribute("__Internal") static private function _WebViewInjectorLoadUrl(url : String) {}
@DllImportAttribute("__Internal") static private function _WebViewInjectorPollMessage() : String {}

private static function InstallPlatform() {
    _WebViewInjectorInstall(instance.lastRequestedUrl);
}

private static function UpdatePlatform() {
    if (instance.loadRequest) _WebViewInjectorLoadUrl(instance.lastRequestedUrl);
}

static function PollMessage() : WebMediatorMessage {
    var message = _WebViewInjectorPollMessage();
    return message ? new WebMediatorMessage(message) : null;
}

#endif
