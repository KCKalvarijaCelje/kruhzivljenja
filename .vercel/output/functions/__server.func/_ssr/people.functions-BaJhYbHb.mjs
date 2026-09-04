import { c as createSsrRpc } from "./createSsrRpc-Bob-CuPr.mjs";
import { c as createServerFn } from "./server-Dm1gvL4M.mjs";
function generateProfileSlug(firstName, lastName, fullName, email) {
  const transliterate = (str) => str.toLowerCase().replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  let slug = "";
  if (first && last) {
    slug = `${transliterate(first)}_${transliterate(last)}`;
  } else if (fullName && fullName.trim()) {
    slug = transliterate(fullName.trim());
  } else if (email && email.trim()) {
    slug = transliterate(email.split("@")[0]);
  } else {
    slug = `user_${Date.now().toString(36)}`;
  }
  return `p-${slug}`;
}
const serverGetPeopleData = createServerFn({
  method: "GET"
}).handler(createSsrRpc("0e399adf27d93761e74c3199fde76d30a7d71660553c49e3832cdec9e2af57c4"));
const serverSavePerson = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("ca80e46b932e8662b910d9df77f23a3142721e4d2005bdf04ff72f08c82d88a5"));
const serverDeletePerson = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("1729a3b2dea3dfeecfba1b648a282bd41e907753b26e5fd0de42f649b4a838f9"));
export {
  serverSavePerson as a,
  serverDeletePerson as b,
  generateProfileSlug as g,
  serverGetPeopleData as s
};
