import React, { useState, useEffect } from "react";
import data from "./data.json";
import SockJS from "sockjs-client";

// Import các ảnh từ thư mục image
import anh1 from "./image/anh1.jpg";
import anh2 from "./image/anh2.jpg";
import anh3 from "./image/anh3.jpg";
import anh4 from "./image/anh4.jpg";
import anh5 from "./image/anh5.jpg";
import anh6 from "./image/anh6.jpg";
import anh7 from "./image/anh7.jpg";
import anh8 from "./image/anh8.jpg";
import anh9 from "./image/anh9.jpg";
import anh10 from "./image/anh10.jpg";

function App() {
  const [products, setProducts] = useState([]);
  const [previousProducts, setPreviousProducts] = useState([]); // Store previous products for undo

  useEffect(() => {
    const storedProducts =
      JSON.parse(localStorage.getItem("scannedProducts")) || [];
    setProducts(storedProducts);

    const sock = new SockJS("http://localhost:8090/echo");

    sock.onopen = () => {
      console.log("Kết nối thành công với server!");
    };

    sock.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        const epc = parsedData.epc;
        handleProductClick(epc);
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu từ server:", error);
      }
    };

    sock.onclose = () => {
      console.log("Đã ngắt kết nối với server");
    };

    return () => {
      sock.close();
    };
  }, []);

  const handleProductClick = (epc) => {
    const storedProducts =
      JSON.parse(localStorage.getItem("scannedProducts")) || [];
    const selectedProduct = data.find((item) => item.epc === epc);
    if (!selectedProduct) return;

    const existingProductByEPC = storedProducts.find((product) =>
      product.epcs.includes(epc)
    );

    if (existingProductByEPC) {
      return;
    }

    const existingProductByBarcode = storedProducts.find(
      (product) => product.barcode === selectedProduct.barcode
    );

    if (existingProductByBarcode) {
      const updatedProducts = storedProducts.map((product) =>
        product.barcode === selectedProduct.barcode
          ? {
              ...product,
              quantity: product.quantity + 1,
              epcs: [...product.epcs, epc],
            }
          : product
      );
      setProducts(updatedProducts);
      localStorage.setItem("scannedProducts", JSON.stringify(updatedProducts));
    } else {
      let productImage;
      switch (selectedProduct.barcode) {
        case "daugoi":
          productImage = anh1;
          break;
        case "kim":
          productImage = anh2;
          break;
        case "nuochoa":
          productImage = anh3;
          break;
        case "usb20":
          productImage = anh4;
          break;
        case "daugio":
          productImage = anh5;
          break;
        case "opetacid":
          productImage = anh6;
          break;
        case "sapthom":
          productImage = anh7;
          break;
        case "scanneuron":
          productImage = anh8;
          break;
        case "masoi":
          productImage = anh9;
          break;
        case "usb":
          productImage = anh10;
          break;
        default:
          productImage = "";
      }

      const newProduct = {
        ...selectedProduct,
        quantity: 1,
        epcs: [epc],
        image: productImage,
      };

      const updatedProducts = [...storedProducts, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem("scannedProducts", JSON.stringify(updatedProducts));
    }
  };

  const handleRemoveProduct = (epc) => {
    const updatedProducts = products.filter(
      (product) => !product.epcs.includes(epc)
    );
    setProducts(updatedProducts);
    localStorage.setItem("scannedProducts", JSON.stringify(updatedProducts));
  };

  const getTotalPrice = () => {
    const total = products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
    return total.toLocaleString("vi-VN");
  };

  const handleRefresh = () => {
    setPreviousProducts(products); // Store current products before clearing
    localStorage.removeItem("scannedProducts");
    setProducts([]);
  };

  const handleUndo = () => {
    setProducts(previousProducts); // Restore previous products
    localStorage.setItem("scannedProducts", JSON.stringify(previousProducts));
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <header style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 3 }}>
          <h2>Thông tin sản phẩm:</h2>
          {products.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ width: "100px", textAlign: "center" }}>Ảnh</th>
                  <th style={{ width: "200px", textAlign: "left" }}>
                    Tên sản phẩm
                  </th>
                  <th style={{ width: "150px", textAlign: "left" }}>
                    Danh mục
                  </th>
                  <th style={{ width: "80px", textAlign: "center" }}>
                    Số lượng
                  </th>
                  <th style={{ width: "120px", textAlign: "right" }}>
                    Đơn giá
                  </th>
                  <th style={{ width: "120px", textAlign: "right" }}>
                    Thành tiền
                  </th>
                  <th style={{ width: "50px", textAlign: "center" }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                    <td style={{ textAlign: "center" }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td style={{ textAlign: "left" }}>{product.name}</td>
                    <td style={{ textAlign: "left" }}>{product.category}</td>
                    <td style={{ textAlign: "center" }}>{product.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      {product.price.toLocaleString("vi-VN")} VND
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {(product.price * product.quantity).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VND
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleRemoveProduct(product.epc)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "20px",
                          color: "red",
                          fontWeight: "bold",
                        }}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Chưa có sản phẩm nào được chọn.</p>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={handleRefresh}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#ffcccc",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Làm mới
            </button>
            <button
              onClick={handleUndo}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#ccffcc",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Hoàn tác
            </button>
          </div>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h3 style={{ color: "red", fontSize: "24px" }}>Tổng tiền:</h3>
            <p style={{ color: "red", fontSize: "36px", fontWeight: "bold" }}>
              {getTotalPrice()} VND
            </p>
          </div>
          <button
            className="payment-btn"
            style={{
              backgroundColor: "#00e5ff",
              color: "#000",
              fontSize: "24px",
              padding: "20px 40px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          >
            Thanh toán
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
