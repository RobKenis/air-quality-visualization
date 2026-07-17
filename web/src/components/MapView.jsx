import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function MapView({ initialPoint, locations, onMarkerClick }) {
    return (
        <div className="map-panel">
            <MapContainer center={initialPoint} zoom={13} scrollWheelZoom={true} className="map-container">
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

                    return (
                        <Marker
                            key={location.id}
                            position={[lat, lon]}
                            eventHandlers={{
                                click: () => onMarkerClick(location),
                            }}
                        >
                            <Popup>{location.name}</Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

export default MapView;
