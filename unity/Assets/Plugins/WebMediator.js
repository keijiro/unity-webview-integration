#pragma strict

// WebView との仲介を行うスクリプト。

import System.Runtime.InteropServices;

// メッセージクラス
class WebMediatorMessage {
    var path : String;          // メッセージパス
    var args : Hashtable;     // 引数テーブル

    // コンストラクタの定義
    function WebMediatorMessage(rawMessage : String) {
        // パス部分を抽出。
        var split = rawMessage.Split("?"[0]);
        path = split[0];
        // パラメーター部分の分解。
        args = new Hashtable();
        if (split.Length > 1) {
            for (var pair in split[1].Split("&"[0])) {
                var elems = pair.Split("="[0]);
                args[elems[0]] = WWW.UnEscapeURL(elems[1]);
            }
        }
    }
}

// 唯一のインスタンス
private static var instance : WebMediator;

private var lastRequestedUrl : String;  // 最近リクエストされた URL
private var loadRequest : boolean;      // 読み込みリクエストフラグ
private var visibility : boolean;       // 表示状態
private var leftMargin : int;           // マージン幅
private var topMargin : int;
private var rightMargin : int;
private var bottomMargin : int;

// WebView のインストール
static function Install() {
    if (instance == null) {
        // 更新用ゲームオブジェクトを作る。
        instance = (new GameObject()).AddComponent.<WebMediator>();
        // プラットフォーム依存の組み込み。
        InstallPlatform();
    }
}

// マージン幅の設定
static function SetMargin(left : int, top: int, right : int, bottom : int) {
    instance.leftMargin = left;
    instance.topMargin = top;
    instance.rightMargin = right;
    instance.bottomMargin = bottom;
}

// 表示状態の操作
static function Show() {
    instance.visibility = true;
}
static function Hide() {
    instance.visibility = false;
}
static function IsVisible() {
    return instance.visibility;
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
    activity.Call("updateWebView", instance.lastRequestedUrl ? instance.lastRequestedUrl : "", instance.loadRequest, instance.visibility, instance.leftMargin, instance.topMargin, instance.rightMargin, instance.bottomMargin);
}

static function PollMessage() : WebMediatorMessage {
    var activity = unityPlayerClass.GetStatic.<AndroidJavaObject>("currentActivity");
    var message = activity.Call.<String>("pollWebViewMessage");
    return message ? new WebMediatorMessage(message) : null;
}

#endif
