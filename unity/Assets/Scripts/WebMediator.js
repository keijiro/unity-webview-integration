#pragma strict

var prefabRedBox : GameObject;
var prefabBlueBox : GameObject;

#if UNITY_ANDROID && !UNITY_EDITOR

private var injector : AndroidJavaClass;

function Awake() {
    injector = AndroidJavaClass("jp.radiumsoftware.unity.plugin.webmediator.WebViewInjector");
    injector.CallStatic("install", "http://dl.dropbox.com/u/14572092/WebMediator/mediator.html");
    //injector.CallStatic("install", "file:///android_asset/mediator.html");
}

function Update() {
    var jsif = injector.GetStatic.<AndroidJavaObject>("jsif");
    var message = jsif.Call.<String>("popMessage");
    if (message == "Red") {
        Instantiate(prefabRedBox, prefabRedBox.transform.position, Random.rotation);
    } else if (message == "Blue") {
        Instantiate(prefabBlueBox, prefabBlueBox.transform.position, Random.rotation);
    }
}

#endif
