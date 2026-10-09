import { useEffect, useRef, useState } from "react";
import { loadScript, loadStyle, useInView } from "./hooks";

const CESIUM_BASE = "https://cdn.jsdelivr.net/npm/cesium@1.120.0/Build/Cesium/";

type Site = { name: string; lon: number; lat: number };

const SITES: Site[] = [
  { name: "Sydney", lon: 151.2093, lat: -33.8688 },
  { name: "Singapore", lon: 103.8198, lat: 1.3521 },
  { name: "Dubai", lon: 55.2708, lat: 25.2048 },
  { name: "London", lon: -0.1276, lat: 51.5072 },
  { name: "San Francisco", lon: -122.4194, lat: 37.7749 },
  { name: "Tokyo", lon: 139.6917, lat: 35.6895 },
];

export default function CesiumDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const { started } = useInView(rootRef);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const controllerRef = useRef<any>(null);
  const [coarse, setCoarse] = useState(false);
  const [armed, setArmed] = useState<boolean | null>(null);

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    setCoarse(touch);
    setArmed(!touch);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!started || !armed || !mount) {
      return undefined;
    }

    let disposed = false;
    let viewer: any = null;
    let timer = 0;
    const touch = window.matchMedia("(pointer: coarse)").matches;

    (window as any).CESIUM_BASE_URL = CESIUM_BASE;
    loadStyle(`${CESIUM_BASE}Widgets/widgets.css`);

    loadScript(`${CESIUM_BASE}Cesium.js`)
      .then(() => {
        if (disposed) {
          return;
        }

        const C = (window as any).Cesium;
        viewer = new C.Viewer(mount, {
          baseLayer: new C.ImageryLayer(
            new C.UrlTemplateImageryProvider({
              url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              maximumLevel: 19,
              credit: "© OpenStreetMap contributors",
            }),
          ),
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
        });

        const scene = viewer.scene;
        scene.globe.enableLighting = true;
        scene.globe.baseColor = C.Color.fromCssColorString("#14130f");
        scene.backgroundColor = C.Color.fromCssColorString("#14130f");
        scene.screenSpaceCameraController.enableInputs = !touch;
        controllerRef.current = scene.screenSpaceCameraController;

        const accent = C.Color.fromCssColorString("#d4401a");
        const toCartesian = (site: Site) => C.Cartesian3.fromDegrees(site.lon, site.lat, 0);

        SITES.forEach((site) => {
          viewer.entities.add({
            position: toCartesian(site),
            point: { pixelSize: 9, color: accent, outlineColor: C.Color.WHITE, outlineWidth: 2 },
            label: {
              text: site.name,
              font: "13px sans-serif",
              fillColor: C.Color.WHITE,
              outlineColor: C.Color.BLACK,
              outlineWidth: 3,
              style: C.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new C.Cartesian2(0, -18),
              distanceDisplayCondition: new C.DistanceDisplayCondition(0, 2.5e7),
            },
          });
        });

        const arc = (a: Site, b: Site) => {
          const start = toCartesian(a);
          const end = toCartesian(b);
          const lift = C.Cartesian3.angleBetween(start, end) * 0.9e6;
          const points: unknown[] = [];

          for (let i = 0; i <= 48; i += 1) {
            const f = i / 48;
            const mid = C.Cartesian3.normalize(
              C.Cartesian3.lerp(start, end, f, new C.Cartesian3()),
              new C.Cartesian3(),
            );
            const radius = 6378137 + Math.sin(Math.PI * f) * lift;
            points.push(C.Cartesian3.multiplyByScalar(mid, radius, new C.Cartesian3()));
          }
          return points;
        };

        SITES.forEach((site, i) => {
          viewer.entities.add({
            polyline: {
              positions: arc(site, SITES[(i + 1) % SITES.length]),
              width: 3,
              material: new C.PolylineGlowMaterialProperty({ glowPower: 0.25, color: accent }),
            },
          });
        });

        viewer.camera.setView({ destination: C.Cartesian3.fromDegrees(100, 10, 2.4e7) });
        setReady(true);

        let index = 0;
        const hop = () => {
          if (disposed || viewer.isDestroyed()) {
            return;
          }
          const site = SITES[index % SITES.length];
          index += 1;
          viewer.camera.flyTo({
            destination: C.Cartesian3.fromDegrees(site.lon, site.lat - 8, 3.2e6),
            orientation: { heading: 0, pitch: C.Math.toRadians(-52), roll: 0 },
            duration: 4,
          });
        };
        hop();
        timer = window.setInterval(hop, 6500);
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      window.clearInterval(timer);
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, [started, armed]);

  const toggle = () => {
    const next = !interactive;
    setInteractive(next);
    if (controllerRef.current) {
      controllerRef.current.enableInputs = next;
    }
  };

  return (
    <div className="demo" ref={rootRef}>
      <div className="demo__cesium" ref={mountRef} />
      {failed && <span className="demo__status">Demo unavailable offline</span>}
      {coarse && armed === false && (
        <button type="button" className="demo__load" onClick={() => setArmed(true)}>
          Load live globe (about 5 MB)
        </button>
      )}
      {armed && started && !ready && !failed && (
        <span className="demo__status demo__status--loading">Loading Cesium</span>
      )}
      {coarse && ready && (
        <button type="button" className="demo__toggle" onClick={toggle}>
          {interactive ? "Lock globe" : "Explore globe"}
        </button>
      )}
    </div>
  );
}
