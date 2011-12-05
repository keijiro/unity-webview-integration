#pragma strict

// WebView-Unity mediator plugin script.

import System.Runtime.InteropServices;

// Message container class.
class WebMediatorMessage {
    var path : String;      // Message path
    var args : Hashtable;   // Argument table

    function WebMediatorMessage(rawMessage : String) {
        // Retrieve a path.
        var split = rawMessage.Split("?"[0]);
        path = split[0];
        // Parse arguments.
        args = new Hashtable();
        if (split.Length > 1) {
            for (var pair in split[1].Split("&"[0])) {
                var elems = pair.Split("="[0]);
                args[elems[0]] = WWW.UnEscapeURL(elems[1]);
            }
        }
    }
}

private static var instance : WebMediator;

private var lastRequestedUrl : String;
private var loadRequest : boolean;
private var visibility : boolean;
private var leftMargin : int;
private var topMargin : int;
private var rightMargin : int;
private var bottomMargin : int;

// Install the plugin.
// Call this at least once before using the plugin.
static function Install() {
    if (instance == null) {
        var master = new GameObject("WebMediator");
        DontDestroyOnLoad(master);
        instance = master.AddComponent.<WebMediator>();
        InstallPlatform();
    }
}

// Set margins around the web view.
static function SetMargin(left : int, top: int, right : int, bottom : int) {
    instance.leftMargin = left;
    instance.topMargin = top;
    instance.rightMargin = right;
    instance.bottomMargin = bottom;
}

// Visibility functions.
static function Show() {
    instance.visibility = true;
}
static function Hide() {
    instance.visibility = false;
}
static function IsVisible() {
    return instance.visibility;
}

// Load the page at the URL.
static function LoadUrl(url : String) {
    instance.lastRequestedUrl = url;
    instance.loadRequest = true;
}

function Update() {
    UpdatePlatform();
    instance.loadRequest = false;
}

#if UNITY_EDITOR

// Unity Editor implementation.

private static function InstallPlatform() { }
private static function UpdatePlatform() { }
static function PollMessage() : WebMediatorMessage { return null; }

#elif UNITY_ANDROID

// Android platform implementation.

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
