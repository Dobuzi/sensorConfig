export type SensorVendorType = "camera" | "radar" | "ultrasonic" | "lidar";

export type SensorSpec = {
  vendorId: string;
  vendorName: string;
  sensorType: SensorVendorType;
  category: string;
  modelName: string;
  specs: {
    horizontalFOVDeg: number;
    verticalFOVDeg: number | null;
    rangeM: number;
    pointRateKpps?: number;
  };
  source: {
    url: string;
    accessedAt: string;
    note: string;
  };
};

export const SENSOR_SPECS: SensorSpec[] = [
  {
    vendorId: "mobileye",
    vendorName: "Mobileye",
    sensorType: "camera",
    category: "narrow",
    modelName: "EyeQ camera (narrow, ref)",
    specs: { horizontalFOVDeg: 45, verticalFOVDeg: 30, rangeM: 200 },
    source: {
      url: "https://www.mobileye.com/",
      accessedAt: "2026-01-15",
      note: "Public references to narrow camera tiers; values approximated for MVP."
    }
  },
  {
    vendorId: "mobileye",
    vendorName: "Mobileye",
    sensorType: "camera",
    category: "main",
    modelName: "EyeQ camera (main, ref)",
    specs: { horizontalFOVDeg: 80, verticalFOVDeg: 45, rangeM: 140 },
    source: {
      url: "https://www.mobileye.com/",
      accessedAt: "2026-01-15",
      note: "Publicly discussed main camera FOV ranges; approximated."
    }
  },
  {
    vendorId: "mobileye",
    vendorName: "Mobileye",
    sensorType: "camera",
    category: "wide",
    modelName: "EyeQ camera (wide, ref)",
    specs: { horizontalFOVDeg: 140, verticalFOVDeg: 60, rangeM: 100 },
    source: {
      url: "https://www.mobileye.com/",
      accessedAt: "2026-01-15",
      note: "Wide camera tiers publicly referenced; approximated."
    }
  },
  {
    vendorId: "onsemi",
    vendorName: "onsemi",
    sensorType: "camera",
    category: "narrow",
    modelName: "AR0234 module (narrow ref)",
    specs: { horizontalFOVDeg: 55, verticalFOVDeg: 35, rangeM: 180 },
    source: {
      url: "https://www.onsemi.com/",
      accessedAt: "2026-01-15",
      note: "AR-series image sensors; module-level FOV approximated for MVP."
    }
  },
  {
    vendorId: "onsemi",
    vendorName: "onsemi",
    sensorType: "camera",
    category: "main",
    modelName: "AR0820 module (main ref)",
    specs: { horizontalFOVDeg: 90, verticalFOVDeg: 50, rangeM: 140 },
    source: {
      url: "https://www.onsemi.com/",
      accessedAt: "2026-01-15",
      note: "AR-series image sensors; module-level FOV approximated."
    }
  },
  {
    vendorId: "onsemi",
    vendorName: "onsemi",
    sensorType: "camera",
    category: "wide",
    modelName: "AR0144 module (wide ref)",
    specs: { horizontalFOVDeg: 120, verticalFOVDeg: 60, rangeM: 110 },
    source: {
      url: "https://www.onsemi.com/",
      accessedAt: "2026-01-15",
      note: "AR-series image sensors; wide FOV approximated."
    }
  },
  {
    vendorId: "continental",
    vendorName: "Continental",
    sensorType: "radar",
    category: "srr",
    modelName: "SRR (short range)",
    specs: { horizontalFOVDeg: 120, verticalFOVDeg: 20, rangeM: 50 },
    source: {
      url: "https://www.continental-automotive.com/",
      accessedAt: "2026-01-15",
      note: "Public SRR family specs; approximated."
    }
  },
  {
    vendorId: "continental",
    vendorName: "Continental",
    sensorType: "radar",
    category: "mrr",
    modelName: "MRR (mid range)",
    specs: { horizontalFOVDeg: 60, verticalFOVDeg: 12, rangeM: 120 },
    source: {
      url: "https://www.continental-automotive.com/",
      accessedAt: "2026-01-15",
      note: "Public MRR family specs; approximated."
    }
  },
  {
    vendorId: "continental",
    vendorName: "Continental",
    sensorType: "radar",
    category: "lrr",
    modelName: "LRR (long range)",
    specs: { horizontalFOVDeg: 20, verticalFOVDeg: 6, rangeM: 250 },
    source: {
      url: "https://www.continental-automotive.com/",
      accessedAt: "2026-01-15",
      note: "Public LRR family specs; approximated."
    }
  },
  {
    vendorId: "bosch",
    vendorName: "Bosch",
    sensorType: "radar",
    category: "srr",
    modelName: "Bosch SRR (short range)",
    specs: { horizontalFOVDeg: 110, verticalFOVDeg: 20, rangeM: 45 },
    source: {
      url: "https://www.bosch-mobility.com/",
      accessedAt: "2026-01-15",
      note: "Public Bosch SRR references; approximated."
    }
  },
  {
    vendorId: "bosch",
    vendorName: "Bosch",
    sensorType: "radar",
    category: "mrr",
    modelName: "Bosch MRR (mid range)",
    specs: { horizontalFOVDeg: 50, verticalFOVDeg: 10, rangeM: 130 },
    source: {
      url: "https://www.bosch-mobility.com/",
      accessedAt: "2026-01-15",
      note: "Public Bosch mid-range radar references; approximated."
    }
  },
  {
    vendorId: "bosch",
    vendorName: "Bosch",
    sensorType: "radar",
    category: "lrr",
    modelName: "Bosch LRR (long range)",
    specs: { horizontalFOVDeg: 18, verticalFOVDeg: 6, rangeM: 220 },
    source: {
      url: "https://www.bosch-mobility.com/",
      accessedAt: "2026-01-15",
      note: "Public Bosch long-range radar references; approximated."
    }
  },
  {
    vendorId: "bosch",
    vendorName: "Bosch",
    sensorType: "ultrasonic",
    category: "parking",
    modelName: "Bosch ultrasonic (parking)",
    specs: { horizontalFOVDeg: 120, verticalFOVDeg: 60, rangeM: 5 },
    source: {
      url: "https://www.bosch-mobility.com/",
      accessedAt: "2026-01-15",
      note: "Ultrasonic parking sensors; approximated cone FOV."
    }
  },
  {
    vendorId: "continental",
    vendorName: "Continental",
    sensorType: "ultrasonic",
    category: "parking",
    modelName: "Continental ultrasonic (parking)",
    specs: { horizontalFOVDeg: 120, verticalFOVDeg: 60, rangeM: 5.5 },
    source: {
      url: "https://www.continental-automotive.com/",
      accessedAt: "2026-01-15",
      note: "Ultrasonic parking sensors; approximated."
    }
  },
  {
    vendorId: "luminar",
    vendorName: "Luminar",
    sensorType: "lidar",
    category: "long",
    modelName: "Luminar Iris (ref)",
    specs: { horizontalFOVDeg: 120, verticalFOVDeg: 30, rangeM: 250, pointRateKpps: 300 },
    source: {
      url: "https://www.luminartech.com/",
      accessedAt: "2026-01-15",
      note: "Public LiDAR range/FOV references; approximated."
    }
  },
  {
    vendorId: "innoviz",
    vendorName: "Innoviz",
    sensorType: "lidar",
    category: "mid",
    modelName: "InnovizTwo (ref)",
    specs: { horizontalFOVDeg: 120, verticalFOVDeg: 40, rangeM: 200, pointRateKpps: 200 },
    source: {
      url: "https://innoviz.tech/",
      accessedAt: "2026-01-15",
      note: "Public Innoviz references; approximated."
    }
  }
];
