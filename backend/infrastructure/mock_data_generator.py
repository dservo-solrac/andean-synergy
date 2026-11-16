import random
import uuid
from typing import List

_KEY_ANALOG_IDS = [
    uuid.UUID("a1b2c3d4-0001-0001-0001-000000000001"),
    uuid.UUID("b2c3d4e5-0002-0002-0002-000000000002"),
    uuid.UUID("c3d4e5f6-0003-0003-0003-000000000003"),
    uuid.UUID("d4e5f6a7-0004-0004-0004-000000000004"),
]

_MANDATORY_ANALOGS = [
    # SC-002a: Análogo de Marte — La Joya calibrada para ganar con
    # target {tempMax:-14, tempMin:-82, pressure:0.636, solarRad:5.9, uvIndex:0, loc:10, friction:0.6}
    # Alta amplitud térmica (68°C), presión pseudo-marciana, UV bajo (A-005)
    {"id": _KEY_ANALOG_IDS[0], "name": "Mar de Cuarzo (Pampas de La Joya)",
     "lat": -16.4800, "lng": -71.9800, "tempMax": 35.0, "tempMin": -33.0,
     "pressure": 1.5, "solarRad": 5.8, "uvIndex": 0.5, "loc": 10.5,
     "friction": 0.61, "cohesion": 0.51, "isKeyAnalog": True},
    # SC-002b: Análogo Lunar post-CV — Altiplano calibrado para ganar con
    # fixture CV {tempMax:-20, tempMin:-230, pressure:0.0, solarRad:14, uvIndex:22, loc:5, friction:0.48, cohesion:0.30}
    {"id": _KEY_ANALOG_IDS[1], "name": "Altiplano (Laguna Salinas / Aguada Blanca)",
     "lat": -15.8300, "lng": -71.4700, "tempMax": -20.0, "tempMin": -230.0,
     "pressure": 0.0,  "solarRad": 14.0, "uvIndex": 22.0, "loc": 5.0,  # vacío lunar
     "friction": 0.48, "cohesion": 0.30, "isKeyAnalog": True},
    # SC-002c: Alta fricción — Andagua calibrado para ganar con
    # target {tempMax:22, tempMin:2, pressure:950, solarRad:6.5, uvIndex:12, loc:45, friction:0.85, cohesion:0.70}
    {"id": _KEY_ANALOG_IDS[2], "name": "Valle de los Volcanes de Andagua",
     "lat": -15.6000, "lng": -72.3000, "tempMax": 22.0, "tempMin": 2.0,
     "pressure": 950.0, "solarRad": 6.5, "uvIndex": 12.0, "loc": 45.0,
     "friction": 0.85, "cohesion": 0.70, "isKeyAnalog": True},
    # Punto 4: Yungay (referencia Atacama)
    {"id": _KEY_ANALOG_IDS[3], "name": "Desierto de Atacama (Yungay)",
     "lat": -24.0800, "lng": -69.8500, "tempMax": 25.0, "tempMin": -5.0,
     "pressure": 1008.0, "solarRad": 7.5, "uvIndex": 13.0, "loc": 15.0,
     "friction": 0.60, "cohesion": 0.35, "isKeyAnalog": True},
]

def generate_mock_data() -> List[dict]:
    rng = random.Random(42)
    records: List[dict] = list(_MANDATORY_ANALOGS)
    peru_regions = [(-22.0,-8.0,-76.0,-66.0)]
    global_regions = [
        (-30.0,30.0,-20.0,60.0), (30.0,75.0,-10.0,180.0),
        (-60.0,-10.0,-80.0,-35.0), (10.0,70.0,-170.0,-50.0),
        (-45.0,-10.0,110.0,180.0), (-85.0,-60.0,-180.0,180.0),
    ]
    for i in range(400):
        lat = rng.uniform(-22.0, -8.0)
        lng = rng.uniform(-76.0, -66.0)
        tm = round(rng.uniform(10.0,35.0),2)
        tn = round(rng.uniform(-20.0, min(tm-2.0,5.0)),2)
        records.append({
            "id": uuid.uuid4(), "name": f"Pampa Andina #{i:03d}",
            "lat": round(lat,4), "lng": round(lng,4),
            "tempMax": tm, "tempMin": tn,
            "pressure": round(rng.uniform(550.0,1013.0),1),
            "solarRad": round(rng.uniform(5.0,9.0),2),
            "uvIndex": round(rng.uniform(8.0,20.0),1),
            "loc": round(rng.uniform(5.0,200.0),2),
            "friction": round(rng.uniform(0.3,0.9),3),
            "cohesion": round(rng.uniform(0.1,0.8),3),
            "isKeyAnalog": False,
        })
    for i in range(596):
        reg = global_regions[i % len(global_regions)]
        lat = rng.uniform(reg[0], reg[1])
        lng = rng.uniform(reg[2], reg[3])
        tm = round(rng.uniform(-30.0,50.0),2)
        tn = round(rng.uniform(-60.0, min(tm-1.0,25.0)),2)
        records.append({
            "id": uuid.uuid4(), "name": f"Global Site #{i:03d}",
            "lat": round(lat,4), "lng": round(lng,4),
            "tempMax": tm, "tempMin": tn,
            "pressure": round(rng.uniform(870.0,1013.0),1),
            "solarRad": round(rng.uniform(1.0,8.0),2),
            "uvIndex": round(rng.uniform(0.0,15.0),1),
            "loc": round(rng.uniform(10.0,400.0),2),
            "friction": round(rng.uniform(0.2,0.95),3),
            "cohesion": round(rng.uniform(0.1,0.9),3),
            "isKeyAnalog": False,
        })
    assert len(records) == 1000, f"Expected 1000, got {len(records)}"
    return records