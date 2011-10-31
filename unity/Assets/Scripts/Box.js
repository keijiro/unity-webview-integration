#pragma strict

function Update() {
    if (transform.position.y < -2.0) Destroy(gameObject);
}
