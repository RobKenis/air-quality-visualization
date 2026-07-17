import React from "react";
import { Line, Pie } from "react-chartjs-2";

const REQUIRED_POLLUTANTS = ["pm25", "pm10", "o3", "no2", "so2", "co"];
const POLLUTANT_LABELS = {
    pm25: "Particulate Matter 2.5",
    pm10: "Particulate Matter 10",
    o3: "Ozone",
    no2: "Nitrogen Dioxide",
    so2: "Sulfur Dioxide",
    co: "Carbon Monoxide",
};

const formatFrequency = (hours) => {
    if (!Number.isFinite(hours) || hours <= 0) {
        return "Unknown";
    }

    if (hours < 1) {
        return `${Math.round(hours * 60)} min`;
    }

    if (hours < 24) {
        return `${Math.round(hours)} hr`;
    }

    return `${Math.round(hours / 24)} day`;
};

function ChartsPanel({ activeLocation, lineChartData, pieChartData, currentAqiColor }) {
    const measurements = activeLocation?.measurements ?? {};
    const reportedPollutants = Object.keys(measurements).filter((key) => Array.isArray(measurements[key]) && measurements[key].length > 0);
    const reportsAllPollutants = REQUIRED_POLLUTANTS.every((pollutant) => reportedPollutants.includes(pollutant));

    const pollutantFrequencies = Object.entries(measurements)
        .filter(([, values]) => Array.isArray(values) && values.length > 0)
        .map(([pollutant, values]) => {
            const timestamps = values
                .map((entry) => entry?.timestamp)
                .filter(Boolean)
                .map((timestamp) => new Date(timestamp))
                .filter((date) => !Number.isNaN(date.getTime()))
                .sort((a, b) => a - b);

            const intervals = timestamps.slice(1).map((timestamp, index) => (timestamp - timestamps[index]) / (1000 * 60 * 60));
            const medianIntervalHours = intervals.length
                ? [...intervals].sort((a, b) => a - b)[Math.floor(intervals.length / 2)]
                : null;

            return { pollutant, frequency: medianIntervalHours };
        });

    return (
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
                <>
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

                    <div className="chart-card">
                        <h3>Sensor statistics</h3>
                        <div className="sensor-summary">
                            <div className="sensor-summary-pill">
                                <span>All pollutants</span>
                                <strong>{reportsAllPollutants ? "✅ Yes" : "⚠️ No"}</strong>
                            </div>
                            <table className="sensor-table">
                                <thead>
                                    <tr>
                                        <th>Pollutant</th>
                                        <th>Status</th>
                                        <th>Freq.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {REQUIRED_POLLUTANTS.map((pollutant) => {
                                        const isReported = reportedPollutants.includes(pollutant);
                                        const frequencyEntry = pollutantFrequencies.find((entry) => entry.pollutant === pollutant);
                                        return (
                                            <tr key={pollutant}>
                                                <td>
                                                    <span title={POLLUTANT_LABELS[pollutant] || pollutant.toUpperCase()}>
                                                        {pollutant.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${isReported ? "status-present" : "status-missing"}`}>
                                                        {isReported ? "Present" : "Missing"}
                                                    </span>
                                                </td>
                                                <td>{isReported && frequencyEntry ? `~${formatFrequency(frequencyEntry.frequency)}` : "—"}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </aside>
    );
}

export default ChartsPanel;
