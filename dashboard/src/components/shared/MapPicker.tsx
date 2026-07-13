"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type MapValue = {
  latitude: number;
  longitude: number;
};

type MapPickerProps = {
  value: MapValue | null;
  onChange: (value: MapValue) => void;
  height?: string;
};

type LeafletMarker = {
  setLatLng: (latlng: { lat: number; lng: number }) => void;
  on: (
    event: string,
    handler: (event: { target: LeafletMarker }) => void
  ) => void;
  getLatLng: () => { lat: number; lng: number };
};

type LeafletMap = {
  setView: (center: [number, number], zoom: number) => void;
  on: (
    event: string,
    handler: (event: { latlng: { lat: number; lng: number } }) => void
  ) => void;
  remove: () => void;
};

const defaultCenter: MapValue = {
  latitude: 20.5937,
  longitude: 78.9629,
};

const MapPicker = ({ value, onChange, height = "320px" }: MapPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  const center = useMemo(() => {
    if (value) {
      return [value.latitude, value.longitude] as [number, number];
    }
    return [defaultCenter.latitude, defaultCenter.longitude] as [
      number,
      number,
    ];
  }, [value]);

  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current || !(window as any).L) {
      return;
    }

    const L = (window as any).L;
    const markerIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.options.icon = markerIcon;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      mapRef.current!.on("click", (event) => {
        const latlng = event.latlng;
        onChange({ latitude: latlng.lat, longitude: latlng.lng });
      });
    }

    mapRef.current!.setView(center, value ? 15 : 5);

    if (value) {
      if (!markerRef.current) {
        markerRef.current = L.marker([value.latitude, value.longitude], {
          draggable: true,
        }).addTo(mapRef.current!);

        markerRef.current!.on("dragend", (event) => {
          const position = event.target.getLatLng();
          onChange({ latitude: position.lat, longitude: position.lng });
        });
      } else {
        markerRef.current.setLatLng({
          lat: value.latitude,
          lng: value.longitude,
        });
      }
    }
  }, [center, isLeafletReady, onChange, value]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rounded-md border overflow-hidden">
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={() => setIsLeafletReady(true)}
      />
      <div ref={mapContainerRef} style={{ height, width: "100%" }} />
    </div>
  );
};

export default MapPicker;
