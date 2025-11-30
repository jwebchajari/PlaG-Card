import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME;

export async function getMenu() {
	const snapshot = await get(ref(db, `locales/${LOCAL}`));
	return snapshot.val() || {};
}
