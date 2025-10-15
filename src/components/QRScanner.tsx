import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    // Attempt to query permission state if supported (non-blocking)
    const maybeCheckPermission = async () => {
      try {
        type Perms = { query?: (opts: { name: string }) => Promise<{ state: 'granted' | 'denied' | 'prompt' }> } | undefined;
        const perms: Perms = (navigator as unknown as { permissions?: Perms }).permissions;
        const status = await perms?.query?.({ name: 'camera' });
        if (status && status.state === 'granted') {
          setPermissionGranted(true);
        }
      } catch (e) {
        console.warn('Permissions API unavailable or failed', e);
      }
      setInitializing(false);
    };
    maybeCheckPermission();
    return () => {
      try { controlsRef.current?.stop(); } catch (e) { console.warn("QRScanner cleanup stop() failed", e); }
      codeReaderRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const all = await BrowserMultiFormatReader.listVideoInputDevices();
      setDevices(all);
      const back = all.find((d) => /back|rear/i.test(d.label));
      setDeviceId((prev) => back?.deviceId || prev || all[0]?.deviceId);
    } catch (e) {
      setError("Could not list cameras. Check permissions.");
    }
  }, []);

  // If permission becomes granted (via Permissions API detection or user click), load devices
  useEffect(() => {
    if (permissionGranted && devices.length === 0) {
      refreshDevices();
    }
  }, [permissionGranted, devices.length, refreshDevices]);


  useEffect(() => {
    const start = async () => {
      if (!videoRef.current || !codeReaderRef.current || !permissionGranted) return;
      setError(null);
      setActive(true);
      try {
        if (deviceId) {
          controlsRef.current = await codeReaderRef.current.decodeFromVideoDevice(
            deviceId,
            videoRef.current,
            (result: Result | undefined) => {
              if (result?.getText) onDetected(result.getText());
            }
          );
        } else {
          // Fallback: use facingMode to select environment camera (mobile)
          controlsRef.current = await codeReaderRef.current.decodeFromConstraints(
            { video: { facingMode: 'environment' } as MediaTrackConstraints },
            videoRef.current,
            (result: Result | undefined) => {
              if (result?.getText) onDetected(result.getText());
            }
          );
        }
      } catch (e) {
        setError("Failed to start camera. Please allow camera access.");
        setActive(false);
      }
    };
    start();
    return () => {
      try { controlsRef.current?.stop(); } catch (e) { console.warn("QRScanner stop() failed", e); }
      setActive(false);
    };
  }, [deviceId, onDetected, permissionGranted]);

  const requestPermissionAndStart = useCallback(async () => {
    setError(null);
    setInitializing(true);
    try {
      if (!(window.isSecureContext)) {
        throw new Error('Camera access requires HTTPS context. Please use a secure (https) URL.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // Immediately stop the probe stream; ZXing will manage its own
      stream.getTracks().forEach(t => t.stop());
      setPermissionGranted(true);
      await refreshDevices();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Camera permission denied or unavailable. Please allow camera access in your browser settings.";
      setError(msg);
    } finally {
      setInitializing(false);
    }
  }, [refreshDevices]);

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full overflow-hidden rounded-md border bg-black">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
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
        {!permissionGranted ? (
          <Button onClick={requestPermissionAndStart} disabled={initializing}>
            {initializing ? 'Checking…' : 'Enable camera'}
          </Button>
        ) : (
          onCancel && (<Button variant="outline" onClick={onCancel}>Cancel</Button>)
        )}
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      )}
      {!error && !permissionGranted && (
        <div className="text-sm text-muted-foreground">Camera not enabled. Tap "Enable camera" to start scanning.</div>
      )}
      {!error && permissionGranted && !active && (
        <div className="text-sm text-muted-foreground">Initializing camera…</div>
      )}
    </div>
  );
};

export default QRScanner;