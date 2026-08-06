// Data provider selection: "mongo" (default) or "firestore".
// Set DATA_PROVIDER=firestore in production to use Firestore instead of MongoDB.
export function isFirestore() {
  return process.env.DATA_PROVIDER === "firestore";
}
