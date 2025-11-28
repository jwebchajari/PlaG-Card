"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import ExpandedMenu from "@/components/ExpandedMenu";
import ProductList from "@/components/ProductList";
import dummyProducts from "@/data/products";
import MapModal from "@/components/MapModal";
import AddToCartToast from "@/components/AddToCartToast";

export default function Home() {
  const router = useRouter();

  /* ========================= ESTADOS ========================= */
  const [activeTab, setActiveTab] = useState("hamburguesas");
  const [expanded, setExpanded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  /* ========================= LOCAL STORAGE (3 HORAS) ========================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("cartData");
    if (stored) {
      try {
        const { items, timestamp } = JSON.parse(stored);
        const diff = Date.now() - timestamp;
        const limit = 3 * 60 * 60 * 1000; // 3 hs

        if (diff < limit && Array.isArray(items)) {
          setCartItems(items);
        } else {
          localStorage.removeItem("cartData");
        }
      } catch {
        localStorage.removeItem("cartData");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (cartItems.length > 0) {
      localStorage.setItem(
        "cartData",
        JSON.stringify({
          items: cartItems,
          timestamp: Date.now(),
        })
      );
    } else {
      localStorage.removeItem("cartData");
    }
  }, [cartItems]);

  /* ========================= REFERENCIAS SCROLL ========================= */

  const hamburguesasRef = useRef(null);
  const sandwichRef = useRef(null);
  const papasRef = useRef(null);
  const bebidasRef = useRef(null);
  const firstScroll = useRef(true);

  const refs = {
    hamburguesas: hamburguesasRef,
    sandwich: sandwichRef,
    papas: papasRef,
    bebidas: bebidasRef,
  };

  /* ========================= CARRITO ========================= */

  const [toastVisible, setToastVisible] = useState(false);
  const [toastProduct, setToastProduct] = useState("");

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exist = prev.find((i) => i.id === product.id);
      if (exist) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1, notes: "" }];
    });

    // 👇 Mostrar animación de agregado
    setToastProduct(product.name);
    setToastVisible(true);

    setTimeout(() => setToastVisible(false), 1500);
  };


  /* ========================= SCROLL A SECCIONES ========================= */

  useEffect(() => {
    if (firstScroll.current) {
      firstScroll.current = false;
      return;
    }
    const section = refs[activeTab]?.current;
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  /* ========================= RENDER ========================= */

  return (
    <>
      {/* 🔝 TOP NAVBAR */}
      <AddToCartToast show={toastVisible} productName={toastProduct} />

      <TopNavbar
        totalItems={cartItems.reduce(
          (acc, item) => acc + item.quantity,
          0
        )}
      />

      <main
        className="container mb-5 pb-5"
        style={{ paddingTop: "72px", marginTop: "12px" }}
      >
        {/* HORARIOS */}
        <section className="mt-2 mb-4">
          <h2 className="section-title">Horarios de atención</h2>
          <p className="text-muted">
            Lunes a Viernes: <strong>12:00 - 23:00</strong>
            <br />
            Sábados y Domingos: <strong>13:00 - 00:00</strong>
          </p>
        </section>

        {/* HERO ACTIONS */}
        <div className="d-flex flex-column flex-md-row gap-3 mb-4">
          <button
            className="btn btn-warning flex-grow-1 py-3 fw-semibold"
            onClick={() => setShowMap(true)}
          >
            📍 Ver dónde retirar / Cómo llegar
          </button>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Repetto+2280+Rosario"
            target="_blank"
            className="btn btn-outline-dark d-none d-md-block py-3 px-4 fw-semibold"
          >
            🚗 Abrir en Google Maps
          </a>
        </div>

        {/* Hamburguesas */}
        <section ref={hamburguesasRef} id="hamburguesas">
          <h2 className="section-title mb-3">Hamburguesas</h2>
          <ProductList
            addToCart={addToCart}
            products={dummyProducts.hamburguesas}
          />
        </section>

        {/* Sandwiches */}
        <section ref={sandwichRef} id="sandwich">
          <h2 className="section-title mb-3 mt-5">Sandwiches</h2>
          <ProductList
            addToCart={addToCart}
            products={dummyProducts.sandwiches}
          />
        </section>

        {/* Papas */}
        <section ref={papasRef} id="papas">
          <h2 className="section-title mb-3 mt-5">Papas</h2>
          <ProductList addToCart={addToCart} products={dummyProducts.papas} />
        </section>

        {/* Bebidas */}
        <section ref={bebidasRef} id="bebidas">
          <h2 className="section-title mb-3 mt-5">Bebidas</h2>
          <ProductList
            addToCart={addToCart}
            products={dummyProducts.bebidas}
          />
        </section>
      </main>

      {/* MODAL MAPA */}
      <MapModal show={showMap} onClose={() => setShowMap(false)} />

      {/* MENÚ EXPANDIDO */}
      <ExpandedMenu show={expanded} onClose={() => setExpanded(false)} />

      {/* BOTTOM NAVBAR */}
      <BottomNavbar
        active={activeTab}
        setActive={setActiveTab}
        expanded={expanded}
        onExpandToggle={() => setExpanded((prev) => !prev)}
      />
    </>
  );
}
