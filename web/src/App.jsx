import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Line, Pie } from "react-chartjs-2";
import "leaflet/dist/leaflet.css";
import "chart.js/auto";
import "./App.css";

function App() {
    const initialPoint = [51.0948787, 4.9263814]
    const chartColors = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#0891b2"];

    const [locations, setLocations] = useState([])
    const [activeLocation, setActiveLocation] = useState(null)

    useEffect(() => {
        fetch("/api/locations.json")
            .then((res) => res.json())
            .then((json) => setLocations(json));
    }, [])

    const currentAqiColor = useMemo(() => {
        const value = Number(activeLocation?.air_quality);
        if (!Number.isFinite(value)) {
            return "#64748b";
        }
        if (value <= 50) return "#1b5e20";
        if (value <= 100) return "#2e7d32";
        if (value <= 150) return "#f9a825";
        if (value <= 200) return "#ff8f00";
        if (value <= 250) return "#ef6c00";
        if (value <= 300) return "#c62828";
        return "#000000";
    }, [activeLocation?.air_quality]);

    const lineChartData = useMemo(() => {
        if (!activeLocation?.measurements) {
            return null;
        }

        const measurements = Object.entries(activeLocation.measurements).filter(([, values]) => Array.isArray(values) && values.length > 0);
        if (!measurements.length) {
            return null;
        }

        const sortedMeasurements = measurements.map(([pollutant, values]) => [
            pollutant,
            [...values].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        ]);

        const labels = sortedMeasurements[0][1].map((entry) => {
            const date = new Date(entry.timestamp);
            if (Number.isNaN(date.getTime())) {
                return entry.timestamp;
            }
            return date.toLocaleString("en-GB", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        });
        const datasets = sortedMeasurements.map(([pollutant, values], index) => ({
            label: pollutant.toUpperCase(),
            data: values.map((entry) => {
                if (typeof entry.aqi === "number" && entry.aqi !== 0) {
                    return entry.aqi;
                }
                return typeof entry.value === "number" ? entry.value : 0;
            }),
            borderColor: chartColors[index % chartColors.length],
            backgroundColor: `${chartColors[index % chartColors.length]}33`,
            pointRadius: 3,
            borderWidth: 2,
            tension: 0.3,
        }));

        return { labels, datasets };
    }, [activeLocation]);

    const pieChartData = useMemo(() => {
        if (!activeLocation?.measurements) {
            return null;
        }

        const pollutants = Object.entries(activeLocation.measurements).filter(([, values]) => Array.isArray(values) && values.length > 0);
        if (!pollutants.length) {
            return null;
        }

        return {
            labels: pollutants.map(([pollutant]) => pollutant.toUpperCase()),
            datasets: [
                {
                    data: pollutants.map(([, values]) => values[0]?.value ?? 0),
                    backgroundColor: chartColors,
                },
            ],
        };
    }, [activeLocation]);

    return (
        <div className="app-shell">
            <div className="map-panel">
                <MapContainer center={initialPoint} zoom={13} scrollWheelZoom={true} className="map-container">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {Object.keys(locations).map(k => locations[k]).map((location) => {
                        const lat = Number(location && location.latitude);
                        const lon = Number(location && location.longitude);
                        if (!isFinite(lat) || !isFinite(lon)) {
                            console.warn('Skipping invalid location coordinates', location && location.id, location);
                            return null;
                        }
                        return (
                            <Marker
                                key={location.id}
                                position={[lat, lon]}
                                eventHandlers={{
                                    click: () => {
                                        console.log(location.id);
                                        fetch(`/api/${location.id}.json`)
                                            .then((res) => res.json())
                                            .then((json) => setActiveLocation(json));
                                    },
                                }}
                            >
                                <Popup>{location.name}</Popup>
                            </Marker>
                        )
                    })}
                </MapContainer>
            </div>
            <aside className="chart-panel">
                <div className="chart-card">
                    <h2>Current AQI</h2>
                    <div className="air-quality-score" style={{ color: currentAqiColor }}>
                        {activeLocation?.air_quality ?? "—"}
                    </div>
                </div>

                {lineChartData ? (
                    <div className="chart-card">
                        <h3>Air quality timeline</h3>
                        <div className="line-chart-wrapper">
                            <Line
                                data={lineChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: "bottom",
                                            labels: {
                                                usePointStyle: true,
                                                boxWidth: 8,
                                            },
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="chart-card empty-state">
                        <p>Select a marker to view the AQI history.</p>
                    </div>
                )}

                {pieChartData ? (
                    <div className="chart-card">
                        <h3>Current pollutant values</h3>
                        <div className="pie-chart-wrapper">
                            <Pie
                                data={pieChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: "bottom",
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                ) : null}
            </aside>
        </div>
    );
}

export default App;