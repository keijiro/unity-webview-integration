#pragma strict

var redBoxPrefab : GameObject;
var blueBoxPrefab : GameObject;

function OnGUI() {
    var sw = Screen.width;
    var sh = Screen.height;

    if (GUI.Button(Rect(0, 0, 0.5 * sw, 0.05 * sh), "RED")) {
        Instantiate(redBoxPrefab, redBoxPrefab.transform.position, Random.rotation);
    }

    if (GUI.Button(Rect(0.5 * sw, 0, 0.5 * sw, 0.05 * sh), "BLUE")) {
        Instantiate(blueBoxPrefab, blueBoxPrefab.transform.position, Random.rotation);
    }
}
