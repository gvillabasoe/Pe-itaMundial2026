/**
 * Maps canonical country names to their flag image path in /public/flags/
 * All flags are PNGs sourced from the project assets.
 */

const FLAG_MAP: Record<string, string> = {
  "México": "/flags/México.png",
  "Sudáfrica": "/flags/Sudáfrica.png",
  "Corea del Sur": "/flags/Corea.png",
  "Chequia": "/flags/República_Checa.png",
  "Canadá": "/flags/Canadá.png",
  "Bosnia y Herzegovina": "/flags/Bosnia_y_Herzegovina.png",
  "Catar": "/flags/Qatar.png",
  "Suiza": "/flags/Suiza.png",
  "Brasil": "/flags/Brasil.png",
  "Marruecos": "/flags/Marruecos.png",
  "Haití": "/flags/Haiti.png",
  "Escocia": "/flags/Escocia.png",
  "Estados Unidos": "/flags/USA.png",
  "Paraguay": "/flags/Paraguay.png",
  "Australia": "/flags/Australia.png",
  "Turquía": "/flags/Turquia.png",
  "Alemania": "/flags/Alemania.png",
  "Curazao": "/flags/Curazao.png",
  "Costa de Marfil": "/flags/Costa_Marfil.png",
  "Ecuador": "/flags/Ecuador.png",
  "Países Bajos": "/flags/Holanda.png",
  "Japón": "/flags/Japón.png",
  "Suecia": "/flags/Suecia.png",
  "Túnez": "/flags/Túnez.png",
  "Bélgica": "/flags/Bélgica.png",
  "Egipto": "/flags/Egipto.png",
  "Irán": "/flags/Irán.png",
  "Nueva Zelanda": "/flags/Nueva_Zelanda.png",
  "España": "/flags/España.png",
  "Cabo Verde": "/flags/Cabo_Verde.png",
  "Arabia Saudí": "/flags/Arabia_Saudí.png",
  "Uruguay": "/flags/Uruguay.png",
  "Francia": "/flags/Francia.png",
  "Senegal": "/flags/Senegal.png",
  "Irak": "/flags/Iraq.png",
  "Noruega": "/flags/Noruega.png",
  "Argentina": "/flags/Argentina.png",
  "Argelia": "/flags/Argelia.png",
  "Austria": "/flags/Austria.png",
  "Jordania": "/flags/Jordania.png",
  "Portugal": "/flags/Portugal.png",
  "RD Congo": "/flags/RD_Congo.png",
  "Uzbekistán": "/flags/Uzbekistán.png",
  "Colombia": "/flags/Colombia.png",
  "Inglaterra": "/flags/Inglaterra.png",
  "Croacia": "/flags/Croacia.png",
  "Ghana": "/flags/Ghana.png",
  "Panamá": "/flags/Panamá.png",
};

export function getFlagPath(country: string): string | null {
  return FLAG_MAP[country] || null;
}

export default FLAG_MAP;
