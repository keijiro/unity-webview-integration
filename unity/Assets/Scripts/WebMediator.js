#pragma strict

import System.Runtime.InteropServices;

var prefabRedBox : GameObject;
var prefabBlueBox : GameObject;

#if UNITY_EDITOR

#elif UNITY_ANDROID

private var injector : AndroidJavaClass;

function Awake() {
    injector = AndroidJavaClass("jp.radiumsoftware.unity.plugin.webmediator.WebViewInjector");
    injector.CallStatic("install", "http://keijiro.github.com/unity-webview-integration/mediator.html");
}

function Update() {
    var message = injector.CallStatic.<String>("popMessage");
    if (message == "/Red") {
        Instantiate(prefabRedBox, prefabRedBox.transform.position, Random.rotation);
    } else if (message == "/Blue") {
        Instantiate(prefabBlueBox, prefabBlueBox.transform.position, Random.rotation);
    }
}

#elif UNITY_IPHONE

@DllImportAttribute("__Internal") static private function _WebViewInjectorInstall(url : String) {}
@DllImportAttribute("__Internal") static private function _WebViewInjectorPopMessage() : String {}

function Awake() {
    _WebViewInjectorInstall("http://keijiro.github.com/unity-webview-integration/mediator.html");
}

function Update() {
    var message = _WebViewInjectorPopMessage();
    if (message == "/Red") {
        Instantiate(prefabRedBox, prefabRedBox.transform.position, Random.rotation);
    } else if (message == "/Blue") {
        Instantiate(prefabBlueBox, prefabBlueBox.transform.position, Random.rotation);
    }
}

#endif
