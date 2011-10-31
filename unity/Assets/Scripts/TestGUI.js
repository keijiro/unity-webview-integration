#pragma strict

var redBoxPrefab : GameObject;
var blueBoxPrefab : GameObject;

function OnGUI() {
    var sw = Screen.width;
    var sh = Screen.height;

    if (GUI.Button(Rect(0, 0.9 * sh, 0.5 * sw, 0.1 * sh), "RED")) {
        Instantiate(redBoxPrefab, redBoxPrefab.transform.position, Random.rotation);
    }

    if (GUI.Button(Rect(0.5 * sw, 0.9 * sh, 0.5 * sw, 0.1 * sh), "BLUE")) {
        Instantiate(blueBoxPrefab, blueBoxPrefab.transform.position, Random.rotation);
    }
}
