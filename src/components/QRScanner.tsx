import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onDetected: (text: string) => void;
  onCancel?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onDetected, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<boolean>(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    (async () => {
      try {
        const all = await BrowserMultiFormatReader.listVideoInputDevices();
        setDevices(all);
        // Prefer back camera if available
        const back = all.find((d) => /back|rear/i.test(d.label));
        setDeviceId(back?.deviceId || all[0]?.deviceId);
      } catch (e) {
        setError("Could not list cameras. Check permissions.");
      }
    })();
    return () => {
      try {
        controlsRef.current?.stop();
      } catch (e) {
        console.warn("QRScanner cleanup stop() failed", e);
      }
      codeReaderRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  useEffect(() => {
    const start = async () => {
      if (!videoRef.current || !codeReaderRef.current || !deviceId) return;
      setError(null);
      setActive(true);
      try {
        controlsRef.current = await codeReaderRef.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result: Result | undefined, err) => {
            if (result?.getText) {
              const text = result.getText();
              onDetected(text);
            }
            // Ignore decode errors to keep scanning
          }
        );
      } catch (e) {
        setError("Failed to start camera. Please allow camera access.");
        setActive(false);
      }
    };
    start();
    return () => {
      try {
        controlsRef.current?.stop();
      } catch (e) {
        console.warn("QRScanner stop() failed", e);
      }
      setActive(false);
    };
  }, [deviceId, onDetected]);

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full overflow-hidden rounded-md border bg-black">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      </div>
      <div className="flex items-center justify-between gap-2">
        <select
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || "Camera"}
            </option>
          ))}
        </select>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      )}
      {!error && !active && (
        <div className="text-sm text-muted-foreground">Initializing camera…</div>
      )}
    </div>
  );
};

export default QRScanner;
