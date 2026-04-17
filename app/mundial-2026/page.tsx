import { redirect } from "next/navigation";

/**
 * Legacy route — Resultados is now the unified Resultados + Mundial screen.
 */
export default function MundialLegacyRedirect() {
  redirect("/resultados");
}
