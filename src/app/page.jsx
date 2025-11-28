"use client";

import { useEffect, useRef, useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import ExpandedMenu from "@/components/ExpandedMenu";
import ProductList from "@/components/ProductList";
import dummyProducts from "@/data/products";
import MapModal from "@/components/MapModal";

export default function Home() {
  const [activeTab, setActiveTab] = useState("hamburguesas");
  const [expanded, setExpanded] = useState(false);
  const [showMap, setShowMap] = useState(false); // ✅ AGREGADO
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // REFERENCIAS DE SECCIONES PARA SCROLL
  const hamburguesasRef = useRef(null);
  const sandwichRef = useRef(null);
  const papasRef = useRef(null);
  const bebidasRef = useRef(null);

  const refs = {
    hamburguesas: hamburguesasRef,
    sandwich: sandwichRef,
    papas: papasRef,
    bebidas: bebidasRef,
  };

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
  };

  // CUANDO CAMBIA LA TAB → SCROLLEAR A LA SECCIÓN
  useEffect(() => {
    const element = refs[activeTab]?.current;
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <TopNavbar totalItems={cartItems.length} openCart={() => setShowCart(true)} />

      <main className="container mt-3 mb-5 pb-5">

        {/* ================= HORARIOS ================= */}
        <section className="mt-4 mb-4">
          <h2 className="section-title">Horarios de atención</h2>
          <p className="text-muted">
            Lunes a Viernes: <strong>12:00 - 23:00</strong><br />
            Sábados y Domingos: <strong>13:00 - 00:00</strong>
          </p>
        </section>

        {/* ================= HERO ACTIONS ================= */}
        <div className="d-flex flex-column flex-md-row gap-3 mb-4">

          {/* MOBILE + DESKTOP: ABRIR MODAL DE MAPA */}
          <button
            className="btn btn-warning flex-grow-1 py-3 fw-semibold"
            onClick={() => setShowMap(true)}
          >
            📍 Ver dónde retirar / Cómo llegar
          </button>

          {/* SOLO ESCRITORIO: LINK DIRECTO A GOOGLE MAPS */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Repetto+2280+Rosario"
            target="_blank"
            className="btn btn-outline-dark d-none d-md-block py-3 px-4 fw-semibold"
          >
            🚗 Abrir en Google Maps
          </a>
        </div>

        {/* ================= HAMBURGUESAS ================= */}
        <section ref={hamburguesasRef} id="hamburguesas">
          <h2 className="section-title mb-3">Hamburguesas</h2>
          <ProductList addToCart={addToCart} products={dummyProducts.hamburguesas} />
        </section>

        {/* ================= SANDWICHES ================= */}
        <section ref={sandwichRef} id="sandwich">
          <h2 className="section-title mb-3 mt-5">Sandwiches</h2>
          <ProductList addToCart={addToCart} products={dummyProducts.sandwiches} />
        </section>

        {/* ================= PAPAS ================= */}
        <section ref={papasRef} id="papas">
          <h2 className="section-title mb-3 mt-5">Papas</h2>
          <ProductList addToCart={addToCart} products={dummyProducts.papas} />
        </section>

        {/* ================= BEBIDAS ================= */}
        <section ref={bebidasRef} id="bebidas">
          <h2 className="section-title mb-3 mt-5">Bebidas</h2>
          <ProductList addToCart={addToCart} products={dummyProducts.bebidas} />
        </section>
      </main>

      {/* ================= MODAL DE MAPA ================= */}
      <MapModal show={showMap} onClose={() => setShowMap(false)} />

      {/* ================= MENU EXPANDIDO ================= */}
      <ExpandedMenu show={expanded} onClose={() => setExpanded(false)} />

      {/* ================= BOTTOM NAV ================= */}
      <BottomNavbar
        active={activeTab}
        setActive={setActiveTab}
        expanded={expanded}
        onExpandToggle={() => setExpanded((prev) => !prev)}
      />
    </>
  );
}
