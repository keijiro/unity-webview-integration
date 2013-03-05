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
private static var isClearCache : boolean;

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
    ApplyMarginsPlatform();
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

static function SetClearCache()
{
    isClearCache = true;
}

static function SetCache()
{
    isClearCache = false;
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
private static function ApplyMarginsPlatform() { }
static function PollMessage() : WebMediatorMessage { return null; }
static function MakeTransparentWebViewBackground() { }

#elif UNITY_IPHONE

// iOS platform implementation.

@DllImportAttribute("__Internal") static private function _WebViewPluginInstall() {}
@DllImportAttribute("__Internal") static private function _WebViewPluginLoadUrl(url : String, isClearCache : boolean) {}
@DllImportAttribute("__Internal") static private function _WebViewPluginSetVisibility(visibility : boolean) {}
@DllImportAttribute("__Internal") static private function _WebViewPluginSetMargins(left : int, top : int, right : int, bottom : int) {}
@DllImportAttribute("__Internal") static private function _WebViewPluginPollMessage() : String {}
@DllImportAttribute("__Internal") static private function _WebViewPluginMakeTransparentBackground() {}

private static var viewVisibility : boolean;

private static function InstallPlatform() {
    _WebViewPluginInstall();
}

private static function ApplyMarginsPlatform() {
    _WebViewPluginSetMargins(instance.leftMargin, instance.topMargin, instance.rightMargin, instance.bottomMargin);
}

private static function UpdatePlatform() {
    if (viewVisibility != instance.visibility) {
        viewVisibility = instance.visibility;
        _WebViewPluginSetVisibility(viewVisibility);
    }
    if (instance.loadRequest) {
        instance.loadRequest = false;
        _WebViewPluginLoadUrl(instance.lastRequestedUrl, isClearCache);
    }
}

static function PollMessage() : WebMediatorMessage {
    var message =  _WebViewPluginPollMessage();
    return message ? new WebMediatorMessage(message) : null;
}

static function MakeTransparentWebViewBackground()
{
    _WebViewPluginMakeTransparentBackground();
}

#elif UNITY_ANDROID

// Android platform implementation.

private static var unityPlayerClass : AndroidJavaClass;

private static function InstallPlatform() {
    unityPlayerClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
}

private static function ApplyMarginsPlatform() { }

private static function UpdatePlatform() {
    var activity = unityPlayerClass.GetStatic.<AndroidJavaObject>("currentActivity");
    activity.Call("updateWebView", instance.lastRequestedUrl ? instance.lastRequestedUrl : "", instance.loadRequest, instance.visibility, instance.leftMargin, instance.topMargin, instance.rightMargin, instance.bottomMargin);
}

static function PollMessage() : WebMediatorMessage {
    var activity = unityPlayerClass.GetStatic.<AndroidJavaObject>("currentActivity");
    var message = activity.Call.<String>("pollWebViewMessage");
    return message ? new WebMediatorMessage(message) : null;
}

static function MakeTransparentWebViewBackground()
{
    var activity = unityPlayerClass.GetStatic.<AndroidJavaObject>("currentActivity");
    activity.Call("makeTransparentWebViewBackground");
}

#endif
