import { useEffect, useMemo, useState } from "react";

function CreateBillPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, customersResponse] = await Promise.all([
          fetch("http://localhost:5000/api/products", {
            headers: { Authorization: `Bearer ${localStorage.getItem("shopbill_token")}` },
          }),
          fetch("http://localhost:5000/api/customers", {
            headers: { Authorization: `Bearer ${localStorage.getItem("shopbill_token")}` },
          }),
        ]);

        const productsData = await productsResponse.json();
        const customersData = await customersResponse.json();

        setProducts(productsData || []);
        setCustomers(customersData || []);
      } catch (error) {
        setMessage(error.message || "Could not load billing data");
      }
    };

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter((product) =>
      `${product.name} ${product.sku} ${product.barcode || ""}`.toLowerCase().includes(q)
    );
  }, [products, search]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: Number(product.selling_price || 0),
          quantity: 1,
          stock: Number(product.stock || 0),
        },
      ];
    });
  };

  const updateQty = (id, change) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = Math.max(0, item.quantity + change);
          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = subtotal * 0.05;
  const total = Math.max(subtotal + tax - Number(discount || 0), 0);

  const submitBill = async () => {
    if (!cart.length) {
      setMessage("Add at least one product before creating a bill.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
        body: JSON.stringify({
          customer_id: customerId ? Number(customerId) : null,
          discount: Number(discount || 0),
          payment_method: paymentMethod,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Bill creation failed");

      setCart([]);
      setCustomerId("");
      setPaymentMethod("cash");
      setDiscount(0);
      setMessage(`Bill created successfully. Invoice: ${data.sale.invoiceNumber}`);
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    }
  };

  return (
    <section className="dashboard">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Create Bill</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Create a sales invoice from stock</p>
        </div>
      </div>

      {message ? <div className="form-error" style={{ marginBottom: 12 }}>{message}</div> : null}

      <div className="pos-layout" style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 0.9fr", gap: 16 }}>
        <div className="panel" style={{ padding: "1rem" }}>
          <h3>Products</h3>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product name or SKU" />

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {filteredProducts.length === 0 ? (
              <div className="empty-state">No products found</div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #1f2937", background: "#0f172a", color: "#e2e8f0", cursor: "pointer" }}
                  onClick={() => addToCart(product)}
                >
                  <div>
                    <strong>{product.name}</strong>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{product.sku}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div>₹{Number(product.selling_price || 0).toFixed(2)}</div>
                    <small style={{ color: product.stock > 0 ? "#4ade80" : "#f87171" }}>Stock: {product.stock}</small>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: "1rem" }}>
          <h3>Bill Items</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {cart.length === 0 ? (
              <div className="empty-state">No items added yet</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: 10, background: "#0f172a", borderRadius: 12 }}>
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>₹{item.price.toFixed(2)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" onClick={() => updateQty(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: "1rem" }}>
          <h3>Bill Summary</h3>

          <label style={{ display: "block", marginBottom: 8 }}>
            Customer
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} style={{ width: "100%", marginTop: 4 }}>
              <option value="">Walk-in customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Payment
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} style={{ width: "100%", marginTop: 4 }}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="credit">Credit</option>
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Discount
            <input type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} style={{ width: "100%", marginTop: 4 }} />
          </label>

          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tax</span><strong>₹{tax.toFixed(2)}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Discount</span><strong>-₹{Number(discount || 0).toFixed(2)}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20 }}><span>Total</span><strong>₹{total.toFixed(2)}</strong></div>
          </div>

          <button type="button" className="primary-button" style={{ width: "100%", marginTop: 16 }} onClick={submitBill}>
            Save Bill
          </button>
        </div>
      </div>
    </section>
  );
}

export default CreateBillPage;
