import React, { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import "chart.js/auto";
import "./App.css";
import MapView from "./components/MapView";
import ChartsPanel from "./components/ChartsPanel";

const chartColors = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#0891b2"];

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    return date.toLocaleString("en-GB", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

const getAqiColor = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return "#64748b";
    }

    if (numericValue <= 50) return "#1b5e20";
    if (numericValue <= 100) return "#2e7d32";
    if (numericValue <= 150) return "#f9a825";
    if (numericValue <= 200) return "#ff8f00";
    if (numericValue <= 250) return "#ef6c00";
    if (numericValue <= 300) return "#c62828";

    return "#000000";
};

function App() {
    const initialPoint = [51.0948787, 4.9263814];

    const [locations, setLocations] = useState([]);
    const [activeLocation, setActiveLocation] = useState(null);

    useEffect(() => {
        fetch("/api/locations.json")
            .then((res) => res.json())
            .then((json) => setLocations(json));
    }, []);

    const pollutantEntries = useMemo(() => {
        if (!activeLocation?.measurements) {
            return [];
        }

        return Object.entries(activeLocation.measurements).filter(([, values]) => Array.isArray(values) && values.length > 0);
    }, [activeLocation?.measurements]);

    const currentAqiColor = useMemo(() => getAqiColor(activeLocation?.air_quality), [activeLocation?.air_quality]);

    const lineChartData = useMemo(() => {
        if (!pollutantEntries.length) {
            return null;
        }

        const sortedMeasurements = pollutantEntries.map(([pollutant, values]) => [
            pollutant,
            [...values].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        ]);

        const labels = sortedMeasurements[0][1].map((entry) => formatTimestamp(entry.timestamp));
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
    }, [pollutantEntries]);

    const pieChartData = useMemo(() => {
        if (!pollutantEntries.length) {
            return null;
        }

        return {
            labels: pollutantEntries.map(([pollutant]) => pollutant.toUpperCase()),
            datasets: [
                {
                    data: pollutantEntries.map(([, values]) => values[0]?.value ?? 0),
                    backgroundColor: chartColors,
                },
            ],
        };
    }, [pollutantEntries]);

    const locationEntries = Object.values(locations || {});

    const handleMarkerClick = (location) => {
        console.log(location.id);
        fetch(`/api/${location.id}.json`)
            .then((res) => res.json())
            .then((json) => setActiveLocation(json));
    };

    return (
        <div className="app-shell">
            <MapView
                initialPoint={initialPoint}
                locations={locationEntries}
                onMarkerClick={handleMarkerClick}
            />
            <ChartsPanel
                activeLocation={activeLocation}
                lineChartData={lineChartData}
                pieChartData={pieChartData}
                currentAqiColor={currentAqiColor}
            />
        </div>
    );
}

export default App;