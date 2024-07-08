'use client';
import { useState, useEffect, useRef } from 'react';

export default function Advocaat_be() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [index, setIndex] = useState(1);

    const isInitialMount = useRef(true);

    const handleScrape = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/advocaat_be?url=${encodeURIComponent(`https://www.advocaat.be/fr/chercher-un-avocat?theme=droit-de-la-famille&radius&name&languages=fr&page=${index}`)}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const result = await response.json();

            // Check if the result.data values are unique in the data array
            const newData = result.data.filter(newItem => 
                !data.some(item => item.notaryName === newItem.notaryName && item.address === newItem.address)
            );

            // Append the new data to the existing data
            setData((prev) => [...prev, ...newData]);
        } catch (error) {
            console.error('Error al extraer datos:', error);
            setError(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            await handleScrape();
            if (index < 12) {
                setIndex((prevIndex) => prevIndex + 1);
            }
        };

        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchData();
        } else if (index < 12) {
            fetchData();
        }
    }, [index]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Scraper de Sitio Web</h1>
                <div className="mb-4">
                    {loading && <p>Cargando...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {data && data.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-2">Datos Extraídos:</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border">N°</th>
                                            <th className="px-4 py-2 border">Nombre del Notario</th>
                                            <th className="px-4 py-2 border">Dirección</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{idx + 1}</td>
                                                <td className="px-4 py-2 border">{item.notaryName}</td>
                                                <td className="px-4 py-2 border">{item.address}</td>
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
    );
}
