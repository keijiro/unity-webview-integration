#pragma strict

function Update() {
    transform.localRotation = Quaternion.AngleAxis(20.0 * Time.time, Vector3.up);
}
