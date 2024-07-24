"use client";

import { useEffect, useState } from "react";
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';

export default function Notaire_be() {
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // Create Function to Scrap Data
    const handleScrape = async () => {
        setLoading(true);
        setError(null);

        try {
            
            const url = 'https://www.notaire.be/notaire/recherchez?query=a';

            const response = await fetch(`/api/notaire_be?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const result = await response.json();

            setData(result.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error al extraer datos:', error);
        }

    }


    useEffect(() => {
        const fetchData = async () => {
            await handleScrape();
        }
        fetchData();
    }, []);

    useEffect(() => {
        data ? console.log("Data", data) : null;
    }, [data]);

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "data.xlsx");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Scraper de Sitio Web</h1>
                <div className="mb-4">
                    {loading && <p>Cargando...</p>}
                    {error && <p className="text-red-500">Error: {error}</p>}
                    {data && data.length > 0 &&(
                        <div>
                            <div className="mt-4">
                                <button 
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                                    onClick={exportToExcel}
                                >
                                    Exportar a Excel
                                </button>
                                <CSVLink 
                                    data={data} 
                                    filename={"data.csv"}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Exportar a CSV
                                </CSVLink>
                            </div>
                            <h2 className="text-xl font-bold mb-2">Datos Extraídos:</h2>
                            <table className="table-auto w-full">
                                <thead>
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Nombre de Estudio</th>
                                        <th className="border px-4 py-2">Dirección</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { data.map((item, index) => (
                                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                            <td className="border px-4 py-2">{index + 1}</td>
                                            <td className="border px-4 py-2">{item.etude_name}</td>
                                            <td className="border px-4 py-2">{item.etude_address}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
  )
}
