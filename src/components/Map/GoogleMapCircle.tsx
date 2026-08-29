import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface GoogleMapCircleProps {
  center: google.maps.LatLngLiteral;
  radius: number; // in meters
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
}

export const GoogleMapCircle = ({
  center,
  radius,
  strokeColor = '#06b6d4',
  strokeOpacity = 0.8,
  strokeWeight = 2,
  fillColor = '#06b6d4',
  fillOpacity = 0.12,
}: GoogleMapCircleProps) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      map,
      center,
      radius,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      fillColor,
      fillOpacity,
      clickable: false,
    });

    circleRef.current = circle;

    return () => {
      circle.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radius);
      circleRef.current.setOptions({
        strokeColor,
        strokeOpacity,
        strokeWeight,
        fillColor,
        fillOpacity,
      });
    }
  }, [center, radius, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity]);

  return null;
};
