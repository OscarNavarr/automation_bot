'use client';

import { useState, useEffect, useRef } from 'react';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';


export default function Salon_funeraire() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [index, setIndex] = useState(1);

    const isInitialMount = useRef(true);

    const handleScrape = async () => {
        setLoading(true);
        setError(null);
        try {
            for (let i = 1; i <= 5; i++) {
                const response = await fetch(`/api/salon_funeraire?url=${encodeURIComponent(`https://www.salon-funeraire.com/moteur-de-recherche/exposants.htm?Page_DOSSIEREXP=${i}&Unreg_DOSSIEREXP=Y&UnregKw=Y`)}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const result = await response.json();

                

                // Check if the new data is different from the existing data
                setData(prevData => {
                    const isDataDifferent = result.data.some(newItem => {
                        return !prevData.some(prevItem => JSON.stringify(prevItem) === JSON.stringify(newItem));
                    });

                    // Append the new data only if it's different
                    if (isDataDifferent) {
                        return [...prevData, ...result.data];
                    } else {
                        return prevData;
                    }
                });

                setIndex(i); // Update the index
            }
        } catch (error) {
            console.error('Error al extraer datos:', error);
            setError(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            await handleScrape();
        };
        fetchData();
    }, []);

   
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
                    {error && <p className="text-red-500">{error}</p>}
                    {data && data.length > 0 && (
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
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border">N°</th>
                                            <th className="px-4 py-2 border">Exposants de FUNÉRAIRE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{idx + 1}</td>
                                                <td className="px-4 py-2 border">{item.text}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}