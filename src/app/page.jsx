"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import ExpandedMenu from "@/components/ExpandedMenu";
import ProductList from "@/components/ProductList";
import MapModal from "@/components/MapModal";
import AddToCartToast from "@/components/AddToCartToast";
import { calcularEstadoDelDia } from "@/utils/horarios";
import HorariosModal from "@/components/HorariosModal";
import LoadingScreen from "@/components/Loading";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import styles from "./Home.module.css";

// Configuracion de la barra de carga
NProgress.configure({ showSpinner: false, speed: 450, trickleSpeed: 100 });

export default function Home() {
  /* ========================= ESTADOS ========================= */
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
          const catKey =
            categoriasMap[item.categoria?.toLowerCase()] || "otros";

          const basePrice =
            item.oferta && item.valorOferta
              ? Number(item.valorOferta)
              : Number(item.valor);

          agrupados[catKey].push({
            id,
            category: catKey,   // ⬅️ NUEVO
            name: item.nombre || "",
            description: item.descripcion || "",
            price: basePrice || 0,
            valorOriginal: Number(item.valor) || 0,
            valorOferta: item.valorOferta ? Number(item.valorOferta) : null,
            oferta: Boolean(item.oferta),
            image: item.imagen || "/logo.png",
            quantity: 1,
            notes: "",
            meatCount: 1,            // ⬅️ NUEVO
            breadType: "comun",      // ⬅️ NUEVO
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
        setEstadoLocal(calcularEstadoDelDia(normalizados));
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
    bebidas: useRef(null),
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

  /* ========================= CARRITO ========================= */
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

  /* ========================= LOADING ========================= */
  if (!productos || !datosLocal || !horarios || !estadoLocal) {
    return <LoadingScreen />;
  }

  /* ========================= RENDER ========================= */
  return (
    <>
      <AddToCartToast show={toastVisible} productName={toastProduct} />
      <TopNavbar
        totalItems={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      <main className="container mb-5 pb-5" style={{ paddingTop: "72px" }}>
        {/* HERO */}
        <div className={styles.heroCard}>
          <div className={styles.hoursBlock}>


            <div className={styles.hoursBlock}>
              <h2 className={styles.heroTitle}>
                {new Date().toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h2>

              <div className={styles.heroStatus}>
                <span
                  className={
                    estadoLocal.abierto
                      ? styles.statusOpen
                      : styles.statusClosed
                  }
                >
                  {estadoLocal.abierto
                    ? "🟢 Abierto ahora"
                    : `🔴 ${estadoLocal.mensaje}`}
                </span>
              </div>

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

        <HorariosModal
          show={showHorarios}
          onClose={() => setShowHorarios(false)}
          horarios={horarios}
        />

        {/* PRODUCTOS */}
        <section ref={refs.hamburguesas}>
          <h2 className="section-title mb-3">Hamburguesas</h2>
          <ProductList addToCart={addToCart} products={productos.hamburguesas}  extras={datosLocal.extras} />
        </section>

        <section ref={refs.sandwich}>
          <h2 className="section-title mb-3 mt-5">Sandwiches</h2>
          <ProductList addToCart={addToCart} products={productos.sandwich}  extras={datosLocal.extras} />
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


    </>
  );
}
