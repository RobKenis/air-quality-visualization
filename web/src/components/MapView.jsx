import React from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

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

function MapView({ initialPoint, locations, onMarkerClick }) {
    return (
        <div className="map-panel">
            <MapContainer center={initialPoint} zoom={10} scrollWheelZoom={true} className="map-container">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((location) => {
                    const lat = Number(location?.latitude);
                    const lon = Number(location?.longitude);
                    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                        console.warn("Skipping invalid location coordinates", location?.id, location);
                        return null;
                    }

                    const aqi = location?.current_air_quality;
                    if (aqi === undefined || aqi === null) {
                        return null;
                    }

                    const color = getAqiColor(aqi);

                    return (
                        <CircleMarker
                            key={location.id}
                            center={[lat, lon]}
                            radius={15}
                            pathOptions={{
                                color,
                                fillColor: color,
                                fillOpacity: 0.50,
                                weight: 2,
                                stroke: false,
                            }}
                            eventHandlers={{
                                click: () => onMarkerClick(location),
                            }}
                        >
                            <Popup>{location.name}</Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

export default MapView;
