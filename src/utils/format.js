// src/utils/format.js

export const formatPrice = (num) => {
	if (num === null || num === undefined) return "0";
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
