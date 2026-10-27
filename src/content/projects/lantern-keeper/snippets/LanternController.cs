using UnityEngine;

// Sample snippet — replace with your own code.
public class LanternController : MonoBehaviour
{
    [SerializeField] private float maxFuel = 100f;
    [SerializeField] private float burnRate = 2.5f;

    public float Fuel { get; private set; }
    public bool IsLit => Fuel > 0f;

    private void Awake() => Fuel = maxFuel;

    private void Update()
    {
        if (!IsLit) return;
        Fuel = Mathf.Max(0f, Fuel - burnRate * Time.deltaTime);
    }

    public void Refill(float amount) => Fuel = Mathf.Min(maxFuel, Fuel + amount);
}
