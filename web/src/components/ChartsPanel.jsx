import React from "react";
import { Line, Pie } from "react-chartjs-2";

function ChartsPanel({ activeLocation, lineChartData, pieChartData, currentAqiColor }) {
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
    );
}

export default ChartsPanel;
