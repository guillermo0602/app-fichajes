import { ProveedorAutenticacion } from "./src/contexto/Autenticacion";
import Navegacion from "./src/navegacion/navegacion";
import React from "react";

export default function App() {
  return (
    <ProveedorAutenticacion>
        <Navegacion/>
    </ProveedorAutenticacion>
  );
}

