"use client";

import { useEffect, useRef, useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import ExpandedMenu from "@/components/ExpandedMenu";
import ProductList from "@/components/ProductList";
import MapModal from "@/components/MapModal";
import AddToCartToast from "@/components/AddToCartToast";
import { getEstadoLocal } from "@/utils/horarios";
import HorariosModal from "@/components/HorariosModal";
import LoadingScreen from "@/components/Loading";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import styles from "./Home.module.css";
import PWAInitializer from "@/components/PWAInitializer";

NProgress.configure({ showSpinner: false, speed: 450, trickleSpeed: 100 });

export default function Home() {
  const [activeTab, setActiveTab] = useState("hamburguesas");
  const [expanded, setExpanded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastProduct, setToastProduct] = useState("");

  const [cartItems, setCartItems] = useState([]);
  const [showHorarios, setShowHorarios] = useState(false);

  const [productos, setProductos] = useState(null);
  const [datosLocal, setDatosLocal] = useState(null);
  const [horarios, setHorarios] = useState(null);
  const [estadoLocal, setEstadoLocal] = useState(null);

  /* ========================= CARGAR DATOS ========================= */
  useEffect(() => {
    async function fetchAll() {
      try {
        NProgress.start();

        const [prodRes, datosRes, horariosRes] = await Promise.all([
          fetch("/api/locales/comidas"),
          fetch("/api/locales/datos"),
          fetch("/api/locales/horarios"),
        ]);

        const [rawProductos, datos, rawHorarios] = await Promise.all([
          prodRes.json(),
          datosRes.json(),
          horariosRes.json(),
        ]);

        /* ---------- NORMALIZAR COMIDAS ----------- */
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

        Object.entries(rawProductos || {}).forEach(([id, item]) => {
          const catKey = categoriasMap[item.categoria?.toLowerCase()] || "otros";

          const basePrice =
            item.oferta && item.valorOferta
              ? Number(item.valorOferta)
              : Number(item.valor);

          agrupados[catKey].push({
            id, // id del producto (del menú)
            category: catKey,
            name: item.nombre || "",
            description: item.descripcion || "",
            price: basePrice || 0,
            valorOriginal: Number(item.valor) || 0,
            valorOferta: item.valorOferta ? Number(item.valorOferta) : null,
            oferta: Boolean(item.oferta),
            image: item.imagen || "/logo.png",

            // defaults
            quantity: 1,
            notes: "",
            meatCount: 1,
            breadType: "comun",
          });
        });

        setProductos(agrupados);
        setDatosLocal(datos || {});

        /* ---------- NORMALIZAR HORARIOS ----------- */
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

          const franjas = info.franjas
            ? Array.isArray(info.franjas)
              ? info.franjas
              : Object.values(info.franjas)
            : [];

          normalizados[dia] = {
            cerrado: Boolean(info.cerrado),
            franjas,
          };
        });

        setHorarios(normalizados);
        setEstadoLocal(getEstadoLocal(normalizados));
      } catch (err) {
        console.error("ERROR cargando datos:", err);
      } finally {
        NProgress.done();
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
        if (Date.now() - timestamp < 3 * 60 * 60 * 1000) {
          setCartItems(items);
        }
      } catch { }
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
  const refs = {
    hamburguesas: useRef(null),
    sandwich: useRef(null),
    papas: useRef(null),
    otros: useRef(null),
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

  /* ========================= HELPERS ========================= */
  const makeLineId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  /* ========================= CARRITO (NO SUMA / NO AGRUPA) ========================= */
  const addToCart = (product) => {
    // product llega desde ProductCard con la personalización ya calculada

    const lineItem = {
      // ✅ ID ÚNICO POR LÍNEA (clave para que no se sumen)
      id: makeLineId(),

      // ✅ guardamos el id real del producto
      productId: product.id,

      // datos
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.category, // "hamburguesas" | "sandwich" | ...

      // precios
      price: Number(product.price) || 0,
      extraMeatPrice: Number(product.extraMeatPrice) || 0,
      extraBreadPrice: Number(product.extraBreadPrice) || 0,

      // personalización
      meatCount: Number(product.meatCount) || 1,
      breadType: product.breadType || "comun",

      // carrito
      quantity: 1,
      notes: product.notes || "",
    };

    setCartItems((prev) => [...prev, lineItem]);

    setToastProduct(product.name);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  };

  /* ========================= LOADING ========================= */
  if (!productos || !datosLocal || !horarios || !estadoLocal) {
    return <LoadingScreen />;
  }

  /* ========================= RENDER ========================= */
  return (
    <>
      <PWAInitializer />
      <AddToCartToast show={toastVisible} productName={toastProduct} />

      <TopNavbar
        totalItems={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      <main className="container mb-5 pb-5" style={{ paddingTop: "72px" }}>
        {/* HERO */}
        <div className={styles.heroCard}>
          <div className={styles.hoursBlock}>
            <h2 className={styles.heroTitle}>
              {new Date().toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>

            <div className={styles.heroStatus}>
              {estadoLocal.abierto ? (
                <span className={styles.statusOpen}>
                  🟢 Abierto ahora — {estadoLocal.mensaje}
                </span>
              ) : (
                <span className={styles.statusClosed}>
                  🔴 Cerrado — {estadoLocal.mensaje}
                </span>
              )}
            </div>
          </div>

          <button
            className={styles.heroBtn}
            onClick={() => setShowHorarios(true)}
          >
            🕒 Ver horarios
          </button>

          <button className={styles.heroBtn} onClick={() => setShowMap(true)}>
            📍 Cómo llegar
          </button>
        </div>

        {/* MODAL HORARIOS */}
        <HorariosModal
          show={showHorarios}
          onClose={() => setShowHorarios(false)}
          horarios={horarios}
        />

        {/* PRODUCTOS */}
        <section ref={refs.hamburguesas}>
          <h2 className="section-title mb-3">Hamburguesas</h2>
          <ProductList
            addToCart={addToCart}
            products={productos.hamburguesas}
            extras={datosLocal.extras}
          />
        </section>

        <section ref={refs.sandwich}>
          <h2 className="section-title mb-3 mt-5">Sandwiches</h2>
          <ProductList
            addToCart={addToCart}
            products={productos.sandwich}
            extras={datosLocal.extras}
          />
        </section>

        <section ref={refs.papas}>
          <h2 className="section-title mb-3 mt-5">Papas</h2>
          <ProductList addToCart={addToCart} products={productos.papas} />
        </section>

        <section ref={refs.otros}>
          <h2 className="section-title mb-3 mt-5">Otros</h2>
          <ProductList addToCart={addToCart} products={productos.otros} />
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

      <script src="/pwa.js" defer></script>
    </>
  );
}