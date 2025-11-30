"use client";

import { useEffect, useRef, useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import ExpandedMenu from "@/components/ExpandedMenu";
import ProductList from "@/components/ProductList";
import MapModal from "@/components/MapModal";
import AddToCartToast from "@/components/AddToCartToast";
import styles from "./Home.module.css";
import { calcularEstadoDelDia } from "@/utils/horarios";
import HorariosModal from "@/components/HorariosModal";

export default function Home() {
  /* ========================= ESTADOS ========================= */
  const [activeTab, setActiveTab] = useState("hamburguesas");
  const [expanded, setExpanded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [showHorarios, setShowHorarios] = useState(false);

  const [productos, setProductos] = useState({
    hamburguesas: [],
    sandwich: [],
    papas: [],
    bebidas: [],
    otros: [],
  });

  const [datosLocal, setDatosLocal] = useState(null);
  const [horarios, setHorarios] = useState(null);
  const [estadoLocal, setEstadoLocal] = useState({
    abierto: true,
    mensaje: "Cargando...",
  });

  /* ========================= CARGAR DATOS ========================= */

  useEffect(() => {
    async function fetchAll() {
      try {
        // --- 1) COMIDAS ---
        const prodRes = await fetch("/api/locales");
        const raw = await prodRes.json(); // objeto { id: { ...comida }, ... }

        const categoriasMap = {
          hamburguesa: "hamburguesas",
          hamburguesas: "hamburguesas",
          sandwich: "sandwich",
          sandwiches: "sandwich",
          papas: "papas",
          bebidas: "bebidas",
          otros: "otros",
        };

        const agrupados = {
          hamburguesas: [],
          sandwich: [],
          papas: [],
          bebidas: [],
          otros: [],
        };

        if (raw && typeof raw === "object") {
          Object.entries(raw).forEach(([id, item]) => {
            const catKey =
              categoriasMap[item.categoria?.toLowerCase()] || "otros";

            const basePrice =
              item.oferta && item.valorOferta
                ? Number(item.valorOferta)
                : Number(item.valor);

            const price = isNaN(basePrice) ? 0 : basePrice;

            const normalized = {
              id,
              name: item.nombre || "",
              description: item.descripcion || "",
              price,
              valorOriginal: Number(item.valor) || 0,
              valorOferta: item.valorOferta ? Number(item.valorOferta) : null,
              oferta: Boolean(item.oferta),
              image: item.imagen || "/logo.png",
              quantity: 1,
              notes: "",
            };

            agrupados[catKey].push(normalized);
          });
        }

        setProductos(agrupados);

        // --- 2) DATOS DEL LOCAL ---
        const datosRes = await fetch("/api/locales/datos");
        const datos = await datosRes.json();
        setDatosLocal(datos || {});

   // --- 3) HORARIOS ---
const horariosRes = await fetch("/api/locales/horarios");
const rawHorarios = await horariosRes.json();

const diasSemana = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

const normalizados = {};

diasSemana.forEach((dia) => {
  const info = rawHorarios?.[dia] || {};

  // franjas puede venir como array o como objeto {0:{...},1:{...}}
  let franjas = [];

  if (Array.isArray(info.franjas)) {
    franjas = info.franjas;
  } else if (info.franjas && typeof info.franjas === "object") {
    franjas = Object.values(info.franjas);
  }

  normalizados[dia] = {
    cerrado: Boolean(info.cerrado),
    franjas,
  };
});

setHorarios(normalizados);

const estado = calcularEstadoDelDia(normalizados);
setEstadoLocal(estado);



      } catch (err) {
        console.error("ERROR cargando datos:", err);
      }
    }

    fetchAll();
  }, []);

  /* ========================= LOCAL STORAGE CARRITO ========================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("cartData");
    if (stored) {
      try {
        const { items, timestamp } = JSON.parse(stored);
        const diff = Date.now() - timestamp;

        if (diff < 3 * 60 * 60 * 1000 && Array.isArray(items)) {
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

  /* ========================= SCROLL A SECCIONES ========================= */

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

  const firstScroll = useRef(true);

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

  /* ========================= TOAST Y CARRITO ========================= */

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

    setToastProduct(product.name);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  };

  /* ========================= RENDER ========================= */

  if (!datosLocal || !horarios)
    return <p style={{ padding: 20 }}>Cargando menú...</p>;

  return (
    <>
      <AddToCartToast show={toastVisible} productName={toastProduct} />

      <TopNavbar
        totalItems={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      <main className="container mb-5 pb-5" style={{ paddingTop: "72px" }}>

        {/* HERO DINÁMICO */}
        <div className={styles.heroCard}>
          <div className={styles.hoursBlock}>
            <h2 className={styles.heroTitle}>
              {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
            </h2>

            <p className={styles.hoursText}>
              {estadoLocal.mensaje}
            </p>

          </div>

          <button
            className={styles.heroBtn}
            onClick={() => setShowHorarios(true)}
          >
            🕒 Ver horarios
          </button>

          <button
            className={styles.heroBtn}
            onClick={() => setShowMap(true)}
          >
            📍 Cómo llegar
          </button>
        </div>

        <HorariosModal
          show={showHorarios}
          onClose={() => setShowHorarios(false)}
          horarios={horarios}
        />


        {/* PRODUCTOS */}
        <section ref={hamburguesasRef}>
          <h2 className="section-title mb-3">Hamburguesas</h2>
          <ProductList
            addToCart={addToCart}
            products={productos.hamburguesas}
          />
        </section>

        <section ref={sandwichRef}>
          <h2 className="section-title mb-3 mt-5">Sandwiches</h2>
          <ProductList addToCart={addToCart} products={productos.sandwich} />
        </section>

        <section ref={papasRef}>
          <h2 className="section-title mb-3 mt-5">Papas</h2>
          <ProductList addToCart={addToCart} products={productos.papas} />
        </section>

        <section ref={bebidasRef}>
          <h2 className="section-title mb-3 mt-5">Bebidas</h2>
          <ProductList addToCart={addToCart} products={productos.bebidas} />
        </section>
      </main>

      <MapModal show={showMap} onClose={() => setShowMap(false)} />
      <ExpandedMenu show={expanded} onClose={() => setExpanded(false)} />

      <BottomNavbar
        active={activeTab}
        setActive={setActiveTab}
        expanded={expanded}
        onExpandToggle={() => setExpanded((prev) => !prev)}
      />
    </>
  );
}
