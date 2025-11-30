export function normalizeProduct(firebaseItem, id) {
	const price =
		firebaseItem.oferta && firebaseItem.valorOferta
			? Number(firebaseItem.valorOferta)
			: Number(firebaseItem.valor);

	return {
		id: id,
		name: firebaseItem.nombre || "",
		description: firebaseItem.descripcion || "",
		price: price,
		valorOriginal: Number(firebaseItem.valor) || 0,
		valorOferta: firebaseItem.valorOferta
			? Number(firebaseItem.valorOferta)
			: null,
		oferta: Boolean(firebaseItem.oferta),
		image: firebaseItem.imagen || "/logo.png",
		quantity: 1,
		notes: "",
	};
}
