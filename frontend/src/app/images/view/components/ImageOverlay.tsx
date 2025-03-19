interface ImageOverlayProps {
  bbox: number[][];
  zoom: number;
  containerWidth: number;
  containerHeight: number;
}

export default function ImageOverlay({ bbox, zoom, containerWidth, containerHeight }: ImageOverlayProps) {
  if (!bbox || bbox.length !== 4) return null;

  // Scale bbox coordinates to container dimensions
  const scaledBbox = bbox.map(([x, y]) => [
    (x * containerWidth) / 100,
    (y * containerHeight) / 100
  ]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${scaledBbox[0][0]}px`,
        top: `${scaledBbox[0][1]}px`,
        width: `${scaledBbox[2][0] - scaledBbox[0][0]}px`,
        height: `${scaledBbox[2][1] - scaledBbox[0][1]}px`,
        border: '2px solid #1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        pointerEvents: 'none',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        transition: 'all 0.2s ease-in-out',
        zIndex: 1
      }}
    />
  );
} 