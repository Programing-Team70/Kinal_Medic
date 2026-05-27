import React from "react";
import { InventoryMedical } from "../components/inventory.medical.jsx";

export const InventoryPage = () => {
    return (
        <div className="w-full min-h-screen bg-[#f4f6f9]">
            {/* Carga la vista médica completa con su lógica interna */}
            <InventoryMedical />
        </div>
    );
};

export default InventoryPage;