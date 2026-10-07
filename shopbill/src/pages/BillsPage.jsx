import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);
  const invoiceRef = useRef(null);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/sales", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Bill fetch failed");

      setBills(data || []);
    } catch (err) {
      setError(err.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const openInvoice = async (bill) => {
    try {
      setIsFetchingInvoice(true);
      const response = await fetch(`http://localhost:5000/api/sales/${bill.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invoice fetch failed");

      const invoiceItems = Array.isArray(data.items) ? data.items : [];
      const subtotal = Number(data.subtotal || 0);
      const computedTax = Number(data.tax || 0) || subtotal * 0.05;
      const discount = Number(data.discount || 0);
      const total = Number(data.total || 0) || subtotal + computedTax - discount;

      setSelectedBill({
        ...data,
        invoice_number: data.invoice_number || bill.invoice_number,
        items: invoiceItems.map((item) => ({
          ...item,
          lineTax: Number(item.total || 0) * 0.05,
        })),
        subtotal,
        tax: computedTax,
        discount,
        total,
      });
    } catch (err) {
      setError(err.message || "Failed to load invoice details");
    } finally {
      setIsFetchingInvoice(false);
    }
  };

  const closeInvoice = () => {
    setSelectedBill(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`${selectedBill?.invoice_number || "invoice"}.pdf`);
    } catch (err) {
      setError(err.message || "PDF download failed");
    }
  };

  return (
    <section className="dashboard">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Bills</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Previous bills and sales history</p>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="panel" style={{ overflowX: "auto", padding: "1rem" }}>
        {loading ? (
          <p>Loading bills...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="7">No bills found</td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="invoice-row" onClick={() => openInvoice(bill)}>
                    <td>
                      <button type="button" className="invoice-link">
                        #{bill.invoice_number}
                      </button>
                    </td>
                    <td>{bill.customer_name || "Walk-in customer"}</td>
                    <td>{bill.payment_method}</td>
                    <td>{formatCurrency(bill.subtotal)}</td>
                    <td>{formatCurrency(bill.discount)}</td>
                    <td>{formatCurrency(bill.total)}</td>
                    <td>{new Date(bill.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedBill ? (
        <div className="invoice-modal-backdrop" onClick={closeInvoice}>
          <div className="invoice-modal" onClick={(event) => event.stopPropagation()}>
            <div ref={invoiceRef} className="invoice-paper">
              <div className="invoice-header-row no-print">
                <div>
                  <h3>Invoice Details</h3>
                </div>
                <div className="invoice-actions no-print">
                  <button type="button" className="secondary-button" onClick={handlePrint}>Print</button>
                  <button type="button" className="primary-button" onClick={handleDownloadPdf}>Download PDF</button>
                </div>
              </div>

              <div className="invoice-paper-box">
                <div className="invoice-topbar">
                  <div>
                    <div className="company-name">SHOPBILL</div>
                    <div className="company-subtitle">BILLING • INVENTORY</div>
                  </div>
                  <div className="invoice-badge">Invoice</div>
                </div>

                <div className="invoice-meta-grid">
                  <div>
                    <label>Invoice No.</label>
                    <strong>#{selectedBill.invoice_number}</strong>
                  </div>
                  <div>
                    <label>Customer</label>
                    <strong>{selectedBill.customer_name || "Walk-in customer"}</strong>
                  </div>
                  <div>
                    <label>Date</label>
                    <strong>{new Date(selectedBill.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</strong>
                  </div>
                  <div>
                    <label>Payment</label>
                    <strong>{selectedBill.payment_method || "Cash"}</strong>
                  </div>
                </div>

                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Tax</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items && selectedBill.items.length > 0 ? (
                      selectedBill.items.map((item) => (
                        <tr key={`${item.id || item.product_id}-${item.product_name}`}>
                          <td>
                            <div className="invoice-item-name">{item.product_name || item.name}</div>
                            <small>{item.sku || "Product"}</small>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price || item.unit_price || 0)}</td>
                          <td>{formatCurrency(item.lineTax || item.tax || 0)}</td>
                          <td>{formatCurrency((Number(item.total || 0) || Number(item.quantity || 0) * Number(item.price || item.unit_price || 0)) + (Number(item.lineTax || item.tax || 0)) )}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="invoice-empty">No items found for this bill.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="invoice-summary-box">
                  <div className="invoice-summary-row">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(selectedBill.subtotal)}</strong>
                  </div>
                  <div className="invoice-summary-row">
                    <span>Tax</span>
                    <strong>{formatCurrency(selectedBill.tax)}</strong>
                  </div>
                  <div className="invoice-summary-row">
                    <span>Discount</span>
                    <strong>-{formatCurrency(selectedBill.discount)}</strong>
                  </div>
                  <div className="invoice-summary-row total-row">
                    <span>Total</span>
                    <strong>{formatCurrency(selectedBill.total)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="invoice-close-row no-print">
              <button type="button" className="secondary-button" onClick={closeInvoice}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {isFetchingInvoice ? <div className="form-error">Loading invoice...</div> : null}
    </section>
  );
}

export default BillsPage;
