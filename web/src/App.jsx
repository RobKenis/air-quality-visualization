import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import locations from './locations.json'

function App() {
    const initialPoint = [51.0948787, 4.9263814]

    return (
        <MapContainer center={initialPoint} zoom={13} scrollWheelZoom={true} style={{ height: "100vh", width: "100%" }}>
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
                    >
                        <Popup>{location.name}</Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    );
}

export default App;