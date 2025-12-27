import React, { useState, useEffect } from 'react';
import { ChevronDown, Settings, Gauge, Wrench, Download, AlertCircle, Database, RefreshCw } from 'lucide-react';

const trackDatabase = {
  "Smooth Circuits": [
    { name: "Monza", bumpiness: 0.2, speedLevel: "high", elevation: "flat" },
    { name: "Spa-Francorchamps", bumpiness: 0.3, speedLevel: "high", elevation: "hilly" },
    { name: "Brands Hatch", bumpiness: 0.4, speedLevel: "medium", elevation: "hilly" },
    { name: "Laguna Seca", bumpiness: 0.3, speedLevel: "medium", elevation: "hilly" },
    { name: "Circuit de Barcelona-Catalunya", bumpiness: 0.2, speedLevel: "high", elevation: "flat" }
  ],
  "Technical Circuits": [
    { name: "Suzuka", bumpiness: 0.4, speedLevel: "medium", elevation: "moderate" },
    { name: "Tsukuba", bumpiness: 0.3, speedLevel: "low", elevation: "flat" },
    { name: "Autopolis", bumpiness: 0.5, speedLevel: "medium", elevation: "hilly" },
    { name: "Circuit de la Sarthe", bumpiness: 0.4, speedLevel: "high", elevation: "moderate" }
  ],
  "Bumpy/Street": [
    { name: "Nürburgring Nordschleife", bumpiness: 0.9, speedLevel: "high", elevation: "extreme" },
    { name: "Tokyo Expressway", bumpiness: 0.7, speedLevel: "medium", elevation: "moderate" },
    { name: "Trial Mountain", bumpiness: 0.6, speedLevel: "medium", elevation: "hilly" },
    { name: "Deep Forest Raceway", bumpiness: 0.7, speedLevel: "medium", elevation: "extreme" }
  ]
};

const tireCompounds = [
  { name: "Comfort: Hard", code: "CH", grip: 0.70, wear: 1.0, temp: "low" },
  { name: "Comfort: Medium", code: "CM", grip: 0.75, wear: 1.05, temp: "low" },
  { name: "Comfort: Soft", code: "CS", grip: 0.80, wear: 1.10, temp: "medium" },
  { name: "Sport: Hard", code: "SH", grip: 0.85, wear: 1.15, temp: "medium" },
  { name: "Sport: Medium", code: "SM", grip: 0.90, wear: 1.25, temp: "medium" },
  { name: "Sport: Soft", code: "SS", grip: 0.95, wear: 1.35, temp: "high" },
  { name: "Racing: Hard", code: "RH", grip: 1.00, wear: 1.00, temp: "high" },
  { name: "Racing: Medium", code: "RM", grip: 1.10, wear: 1.20, temp: "high" },
  { name: "Racing: Soft", code: "RS", grip: 1.20, wear: 1.45, temp: "veryhigh" },
  { name: "Intermediate", code: "IM", grip: 0.65, wear: 0.90, temp: "low" },
  { name: "Wet", code: "W", grip: 0.50, wear: 0.80, temp: "low" }
];

const tuneFixes = [
  { name: "Balanced", code: "BAL", description: "Neutral handling characteristics" },
  { name: "Reduce Understeer", code: "UNDER", description: "More front grip, sharper turn-in" },
  { name: "Reduce Oversteer", code: "OVER", description: "More rear stability, less rotation" },
  { name: "Increase Stability", code: "STAB", description: "Softer suspension, more predictable" },
  { name: "Increase Agility", code: "AGIL", description: "Stiffer suspension, quicker response" },
  { name: "Wet Weather", code: "WET", description: "Optimize for rain conditions" }
];

class TuningPhysics {
  static calculateNaturalFrequency(springRate, sprungMass) {
    return (1 / (2 * Math.PI)) * Math.sqrt((springRate * 1000) / sprungMass);
  }
  static springRateFromFrequency(frequency, sprungMass) {
    const k = sprungMass * Math.pow(2 * Math.PI * frequency, 2);
    return k / 1000;
  }
  static calculateTorqueToWeight(torque, weight) { return (torque / weight) * 100; }
  static calculatePowerToWeight(hp, weight) { return hp / weight; }
  static estimatePP(hp, weight, aero, grip) {
    const baseValue = (hp / 2) + ((2000 - weight) / 3);
    const aeroBonus = (aero.front + aero.rear) / 10;
    const gripBonus = grip * 50;
    return Math.round(baseValue + aeroBonus + gripBonus);
  }
}

export default function GT7TuningLab() {
  // --- CORRECTED STATE ---
  const [vehicleDatabase, setVehicleDatabase] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTire, setSelectedTire] = useState(tireCompounds[6]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedTuneFix, setSelectedTuneFix] = useState(tuneFixes[0]);
  const [hp, setHp] = useState(500);
  const [torque, setTorque] = useState(450);
  const [weight, setWeight] = useState(1300);
  const [pp, setPp] = useState(700);
  const [ballastWeight, setBallastWeight] = useState(0);
  const [ballastPosition, setBallastPosition] = useState(0);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // --- DATABASE LOGIC ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('./vehicles.json');
        if (!response.ok) throw new Error('404');
        const data = await response.json();
        if (data.vehicles) {
          setVehicleDatabase(data.vehicles);
          console.log("✅ Database loaded successfully");
        }
      } catch (err) {
        console.warn("⚠️ Using offline fallback");
        setError('Using offline vehicle database');
        setVehicleDatabase(getFallbackDatabase());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getFallbackDatabase = () => ({
    "Nissan": {
      "GT-R NISMO GT3 '13": {
        drive: "FR", baseAero: [200, 500], heightRange: [55, 100],
        springRange: [2.0, 16.0], damperRange: [1, 10], antiRollRange: [1, 7],
        camberRange: [-5.0, 0.0], toeRange: [-0.60, 0.60], maxPower: 600,
        baseWeight: 1300, baseTorque: 510, gearRatios: [3.827, 2.36, 1.685, 1.312, 1.097, 0.88],
        finalGear: 3.7
      }
    },
    "Porsche": {
      "911 RSR '17": {
        drive: "MR", baseAero: [300, 700], heightRange: [50, 95],
        springRange: [2.0, 16.0], damperRange: [1, 10], antiRollRange: [1, 7],
        camberRange: [-5.0, 0.0], toeRange: [-0.60, 0.60], maxPower: 510,
        baseWeight: 1245, baseTorque: 434, gearRatios: [3.15, 2.105, 1.619, 1.32, 1.13, 0.971],
        finalGear: 4.0
      }
    }
  });

  // --- HELPER CONSTANTS ---
  const manufacturers = Object.keys(vehicleDatabase).sort();
  const models = selectedManufacturer ? Object.keys(vehicleDatabase[selectedManufacturer]).sort() : [];
  const carData = selectedManufacturer && selectedModel ? vehicleDatabase[selectedManufacturer][selectedModel] : null;
  const allTracks = Object.values(trackDatabase).flat();

  useEffect(() => {
    if (carData) {
      setWeight(carData.baseWeight);
      setHp(carData.maxPower);
      setTorque(carData.baseTorque || Math.round(carData.maxPower * 0.85));
    }
  }, [selectedModel, carData]);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const calculateTune = () => {
    if (!carData || !selectedTrack) return;

    const effectiveWeight = weight + ballastWeight;
    const tqToWeight = TuningPhysics.calculateTorqueToWeight(torque, effectiveWeight);
    const powerToWeight = TuningPhysics.calculatePowerToWeight(hp, effectiveWeight);
    const gripFactor = selectedTire.grip;
    const bumpFactor = selectedTrack.bumpiness;

    // AERODYNAMICS with physics-based calculations
    let frontAero = carData.baseAero[0] + (pp * 0.2);
    let rearAero = carData.baseAero[1] + (pp * 0.3);

    // Aero balance adjustments
    const aeroBalance = frontAero / (frontAero + rearAero);
    
    if (selectedTuneFix.code === 'UNDER') {
      // Reduce front downforce to increase front grip (less downforce = less drag = better turn-in)
      frontAero *= 0.85;
      rearAero *= 1.1;
    } else if (selectedTuneFix.code === 'OVER') {
      frontAero *= 1.15;
      rearAero *= 0.85;
    } else if (selectedTuneFix.code === 'WET') {
      // Less downforce in wet = less grip needed
      frontAero *= 0.90;
      rearAero *= 0.90;
    }

    frontAero = Math.round(clamp(frontAero, carData.baseAero[0], carData.baseAero[0] + 300));
    rearAero = Math.round(clamp(rearAero, carData.baseAero[1], carData.baseAero[1] + 400));

    // SUSPENSION - Physics-based natural frequency calculations
    // Target frequencies: 2.0-2.5 Hz for road cars, 2.5-3.5 Hz for sports, 3.5-4.5 Hz for race
    let targetFreqFront = 2.5 + (powerToWeight * 2);
    let targetFreqRear = targetFreqFront * 1.05;

    // Adjust for track surface
    if (bumpFactor > 0.6) {
      targetFreqFront *= 0.85; // Softer for bumpy tracks
      targetFreqRear *= 0.85;
    }

    // Adjust for tire compound (softer tires need less spring rate)
    targetFreqFront *= (0.9 + gripFactor * 0.1);
    targetFreqRear *= (0.9 + gripFactor * 0.1);

    // Tune fix adjustments
    if (selectedTuneFix.code === 'UNDER') {
      targetFreqFront *= 0.93; // Softer front
      targetFreqRear *= 1.05;  // Stiffer rear
    } else if (selectedTuneFix.code === 'OVER') {
      targetFreqFront *= 1.05;
      targetFreqRear *= 0.93;
    } else if (selectedTuneFix.code === 'AGIL') {
      targetFreqFront *= 1.1;
      targetFreqRear *= 1.1;
    } else if (selectedTuneFix.code === 'STAB') {
      targetFreqFront *= 0.90;
      targetFreqRear *= 0.90;
    } else if (selectedTuneFix.code === 'WET') {
      targetFreqFront *= 0.85; // Much softer for wet
      targetFreqRear *= 0.85;
    }

    // RIDE HEIGHT - Lower for smooth, higher for bumpy
    const minHeight = carData.heightRange[0];
    const maxHeight = carData.heightRange[1];
    let frontHeight = minHeight + (bumpFactor * (maxHeight - minHeight) * 0.3);
    let rearHeight = frontHeight + 5;

    // Aero-dependent ride height (more downforce = can go lower)
    const aeroFactor = (frontAero + rearAero) / 1000;
    frontHeight -= aeroFactor * 5;
    rearHeight -= aeroFactor * 5;

    frontHeight = Math.round(clamp(frontHeight, carData.heightRange[0], carData.heightRange[1]));
    rearHeight = Math.round(clamp(rearHeight, carData.heightRange[0], carData.heightRange[1]));

    // ANTI-ROLL BARS - Stiffer for high grip, softer for low grip
    let frontARB = 3 + (gripFactor * 3);
    let rearARB = 2 + (gripFactor * 3);

    if (selectedTuneFix.code === 'UNDER') {
      frontARB -= 1;
      rearARB += 1;
    } else if (selectedTuneFix.code === 'OVER') {
      frontARB += 1;
      rearARB -= 1;
    } else if (selectedTuneFix.code === 'WET') {
      frontARB *= 0.7; // Much softer in wet
      rearARB *= 0.7;
    }

    frontARB = Math.round(clamp(frontARB, carData.antiRollRange[0], carData.antiRollRange[1]));
    rearARB = Math.round(clamp(rearARB, carData.antiRollRange[0], carData.antiRollRange[1]));

    // DAMPERS - Based on track surface and driving style
    // Compression: controls bump absorption (20-50 range)
    // Expansion (Rebound): controls body control (30-60 range)
    let compression = 28 + (bumpFactor * 18);
    let expansion = 38 + (bumpFactor * 20);

    if (selectedTuneFix.code === 'STAB') {
      compression += 5;
      expansion += 8;
    } else if (selectedTuneFix.code === 'AGIL') {
      compression += 8;
      expansion += 10;
    } else if (selectedTuneFix.code === 'WET') {
      compression -= 8; // Softer damping in wet
      expansion -= 10;
    }

    compression = Math.round(clamp(compression, 15, 50));
    expansion = Math.round(clamp(expansion, 20, 60));

    // CAMBER - More negative for better cornering
    let frontCamber = -2.0 - (gripFactor * 0.8);
    let rearCamber = hp > 550 ? -3.0 : -2.0;

    // Drivetrain-specific camber
    if (carData.drive === 'FF') {
      frontCamber -= 0.5; // More front camber for FWD
    } else if (carData.drive === 'MR' || carData.drive === 'RR') {
      rearCamber -= 0.5; // More rear camber for mid/rear engine
    }

    if (selectedTuneFix.code === 'UNDER') {
      frontCamber += 0.5; // Less negative = more contact patch
    } else if (selectedTuneFix.code === 'OVER') {
      rearCamber += 0.5;
    }

    frontCamber = parseFloat(clamp(frontCamber, carData.camberRange[0], carData.camberRange[1]).toFixed(1));
    rearCamber = parseFloat(clamp(rearCamber, carData.camberRange[0], carData.camberRange[1]).toFixed(1));

    // TOE - Fine-tuning for behavior
    let frontToe = -0.10; // Slight toe-out for turn-in
    let rearToe = 0.20;   // Slight toe-in for stability

    // Drivetrain-specific toe
    if (carData.drive === 'FR' && tqToWeight > 35) {
      rearToe = 0.40; // More rear toe-in for high-power RWD
    } else if (carData.drive === 'FF') {
      frontToe = 0.05; // Slight toe-in for FWD stability
      rearToe = 0.10;
    } else if (carData.drive === '4WD') {
      frontToe = -0.05;
      rearToe = 0.15;
    }

    if (selectedTuneFix.code === 'UNDER') {
      frontToe = -0.20; // More toe-out = sharper turn-in
      rearToe = 0.10;   // Less toe-in = more rotation
    } else if (selectedTuneFix.code === 'OVER') {
      frontToe = 0.00;  // Neutral front
      rearToe = 0.40;   // More rear stability
    } else if (selectedTuneFix.code === 'AGIL') {
      frontToe = -0.15;
      rearToe = 0.10;
    } else if (selectedTuneFix.code === 'WET') {
      frontToe = 0.00;  // Neutral for wet
      rearToe = 0.25;   // More stability
    }

    frontToe = parseFloat(clamp(frontToe, carData.toeRange[0], carData.toeRange[1]).toFixed(2));
    rearToe = parseFloat(clamp(rearToe, carData.toeRange[0], carData.toeRange[1]).toFixed(2));

    // LSD - Drivetrain-specific with physics consideration
    let initialTorque = 10;
    let accelSens = 35;
    let brakeSens = 20;

    if (carData.drive === 'MR' || carData.drive === 'RR') {
      initialTorque = 15;
      accelSens = 25; // Lower to prevent snap oversteer
      brakeSens = 40; // Higher for stability under braking
    } else if (carData.drive === '4WD') {
      initialTorque = 20;
      accelSens = 40;
      brakeSens = 25;
    } else if (carData.drive === 'FF') {
      initialTorque = 8;
      accelSens = 30;
      brakeSens = 15;
    } else if (carData.drive === 'FR') {
      initialTorque = 10;
      if (tqToWeight > 40) {
        accelSens = 50; // Lock more for high torque
      }
    }

    if (selectedTuneFix.code === 'OVER' && (carData.drive === 'FR' || carData.drive === 'MR')) {
      accelSens = Math.min(60, accelSens + 15);
    } else if (selectedTuneFix.code === 'WET') {
      accelSens *= 0.7; // Much less locking in wet
      initialTorque *= 0.7;
    }

    // BRAKE BALANCE
    let brakeBalance = 0;
    
    if (carData.drive === 'FR') brakeBalance = -1;
    if (carData.drive === 'MR' || carData.drive === 'RR') brakeBalance = -2;
    if (carData.drive === '4WD') brakeBalance = 0;
    if (carData.drive === 'FF') brakeBalance = 1;

    // Weight distribution affects brake balance
    if (ballastPosition > 20) {
      brakeBalance -= 1; // More rear weight = more rear brake
    } else if (ballastPosition < -20) {
      brakeBalance += 1;
    }

    if (selectedTuneFix.code === 'UNDER') {
      brakeBalance += 1; // More front brake = induce rotation
    } else if (selectedTuneFix.code === 'OVER') {
      brakeBalance -= 1;
    }

    brakeBalance = clamp(brakeBalance, -5, 5);

    // GEARING - Speed-dependent
    const baseTopSpeed = 240 + (hp / 5);
    let topSpeed = baseTopSpeed;
    
    if (selectedTrack.speedLevel === 'high') {
      topSpeed += 20;
    } else if (selectedTrack.speedLevel === 'low') {
      topSpeed -= 15;
    }

    const finalGearAdjusted = parseFloat((carData.finalGear * (baseTopSpeed / topSpeed)).toFixed(2));

    // BALLAST PP IMPACT
    const ppImpact = ballastWeight > 0 ? Math.round(-ballastWeight / 10) : 0;
    const adjustedPP = pp + ppImpact;

    // PHYSICS VALIDATION
    const sprungMassFront = effectiveWeight * 0.48; // Approximate front weight distribution
    const sprungMassRear = effectiveWeight * 0.52;

    setResults({
      aero: { front: frontAero, rear: rearAero, balance: (aeroBalance * 100).toFixed(1) },
      suspension: {
        height: { front: frontHeight, rear: rearHeight },
        antiRoll: { front: frontARB, rear: rearARB },
        compression,
        expansion,
        frequency: { 
          front: targetFreqFront.toFixed(2), 
          rear: targetFreqRear.toFixed(2) 
        }
      },
      alignment: {
        camber: { front: frontCamber, rear: rearCamber },
        toe: { front: frontToe, rear: rearToe }
      },
      lsd: {
        initial: Math.round(initialTorque),
        accel: Math.round(accelSens),
        brake: Math.round(brakeSens)
      },
      brakeBalance,
      gearing: {
        topSpeed: Math.round(topSpeed),
        finalGear: finalGearAdjusted,
        ratios: carData.gearRatios
      },
      ballast: {
        weight: ballastWeight,
        position: ballastPosition,
        ppImpact
      },
      adjustedPP,
      physics: {
        torqueToWeight: tqToWeight.toFixed(2),
        powerToWeight: powerToWeight.toFixed(3),
        estimatedPP: TuningPhysics.estimatePP(hp, effectiveWeight, { front: frontAero, rear: rearAero }, gripFactor)
      }
    });

    setShowResults(true);
  };

  const exportSetup = () => {
    if (!results) return;
    
    const setup = {
      vehicle: `${selectedManufacturer} ${selectedModel}`,
      track: selectedTrack.name,
      tire: selectedTire.name,
      tuneFix: selectedTuneFix.name,
      specs: { hp, torque, weight, pp: results.adjustedPP },
      tuning: results,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(setup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GT7_${selectedManufacturer}_${selectedModel.replace(/\s/g, '_')}_${selectedTrack.name}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-[#e4000f] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading Vehicle Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&family=Michroma:wght@400&display=swap');
        
        body { 
          font-family: 'Rajdhani', sans-serif;
          background: radial-gradient(ellipse at top, #1a0000 0%, #000000 50%, #000000 100%);
        }
        
        .title-font { 
          font-family: 'Michroma', monospace; 
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
        }
        
        .stat-font {
          font-family: 'Michroma', monospace;
          font-weight: 400;
        }
        
        .racing-stripe {
          background: linear-gradient(90deg, 
            transparent 0%, 
            #e4000f 15%,
            #ff3344 30%,
            #e4000f 50%, 
            #ff3344 70%,
            #e4000f 85%, 
            transparent 100%
          );
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px #e4000f, 0 0 20px #e4000f; }
          50% { text-shadow: 0 0 20px #e4000f, 0 0 40px #e4000f, 0 0 60px #e4000f; }
        }
        
        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .glow-text {
          animation: glow 3s ease-in-out infinite;
        }
        
        .panel {
          background: linear-gradient(135deg, rgba(20, 0, 0, 0.95) 0%, rgba(10, 0, 0, 0.98) 100%);
          border: 1px solid rgba(228, 0, 15, 0.4);
          box-shadow: 0 8px 32px rgba(228, 0, 15, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          position: relative;
        }
        
        .panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e4000f, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .panel:hover::before {
          opacity: 1;
        }
        
        .panel:hover {
          border-color: rgba(228, 0, 15, 0.7);
          box-shadow: 0 12px 48px rgba(228, 0, 15, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        
        .input-field {
          background: rgba(15, 0, 0, 0.8);
          border: 1px solid rgba(228, 0, 15, 0.3);
          transition: all 0.3s ease;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #e4000f;
          box-shadow: 0 0 0 3px rgba(228, 0, 15, 0.15), 0 0 20px rgba(228, 0, 15, 0.3);
          background: rgba(20, 0, 0, 1);
        }
        
        .input-field:hover {
          border-color: rgba(228, 0, 15, 0.5);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #e4000f 0%, #a00000 100%);
          box-shadow: 0 4px 20px rgba(228, 0, 15, 0.5);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .btn-primary:hover::before {
          width: 400px;
          height: 400px;
        }
        
        .btn-primary:hover {
          box-shadow: 0 6px 30px rgba(228, 0, 15, 0.7), 0 0 40px rgba(228, 0, 15, 0.4);
          transform: translateY(-3px) scale(1.02);
        }
        
        .btn-primary:active {
          transform: translateY(-1px) scale(1.0);
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(228, 0, 15, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%);
          border-left: 3px solid #e4000f;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          background: linear-gradient(135deg, rgba(228, 0, 15, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%);
          transform: translateX(5px);
          border-left-width: 4px;
        }
        
        .result-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        }
        
        @media (max-width: 768px) {
          .result-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .hexagon-bg {
          background-image: 
            linear-gradient(30deg, rgba(228, 0, 15, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(228, 0, 15, 0.03) 87.5%, rgba(228, 0, 15, 0.03)),
            linear-gradient(150deg, rgba(228, 0, 15, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(228, 0, 15, 0.03) 87.5%, rgba(228, 0, 15, 0.03)),
            linear-gradient(30deg, rgba(228, 0, 15, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(228, 0, 15, 0.03) 87.5%, rgba(228, 0, 15, 0.03)),
            linear-gradient(150deg, rgba(228, 0, 15, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(228, 0, 15, 0.03) 87.5%, rgba(228, 0, 15, 0.03));
          background-size: 80px 140px;
          background-position: 0 0, 0 0, 40px 70px, 40px 70px;
        }
      `}</style>

      {/* Header */}
      <div className="relative hexagon-bg">
        <div className="racing-stripe h-2 w-full"></div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between animate-slide-in">
            <div>
              <h1 className="title-font text-4xl md:text-6xl lg:text-7xl text-white mb-2 glow-text">
                GT7 <span className="text-[#e4000f]">MASTER</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-lg tracking-[0.3em] uppercase">
                Tuning Laboratory • Physics Engine
              </p>
              {error && (
                <div className="mt-2 flex items-center gap-2 text-yellow-500 text-sm">
                  <Database className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <Gauge className="w-12 h-12 md:w-16 md:h-16 text-[#e4000f]" strokeWidth={1.5} />
          </div>
        </div>
        <div className="racing-stripe h-2 w-full"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Input Panel */}
        <div className="panel rounded-lg p-6 md:p-8 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-[#e4000f]" />
            <h2 className="title-font text-xl md:text-2xl">Vehicle Configuration</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* Manufacturer */}
            <div>
              <label className="block text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Manufacturer</label>
              <select 
                className="input-field w-full px-4 py-3 rounded text-white text-sm md:text-base"
                value={selectedManufacturer}
                onChange={(e) => {
                  setSelectedManufacturer(e.target.value);
                  setSelectedModel('');
                  setShowResults(false);
                }}
              >
                <option value="">Select Manufacturer</option>
                {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Model</label>
              <select 
                className="input-field w-full px-4 py-3 rounded text-white text-sm md:text-base"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setShowResults(false);
                }}
                disabled={!selectedManufacturer}
              >
                <option value="">Select Model</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Tire Compound */}
            <div>
              <label className="block text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Tire Compound</label>
              <select 
                className="input-field w-full px-4 py-3 rounded text-white text-sm md:text-base"
                value={selectedTire.code}
                onChange={(e) => {
                  setSelectedTire(tireCompounds.find(t => t.code === e.target.value));
                  setShowResults(false);
                }}
              >
                {tireCompounds.map(t => (
                  <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                ))}
              </select>
            </div>

            {/* Track */}
            <div>
              <label className="block text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Track</label>
              <select 
                className="input-field w-full px-4 py-3 rounded text-white text-sm md:text-base"
                value={selectedTrack?.name || ''}
                onChange={(e) => {
                  setSelectedTrack(allTracks.find(t => t.name === e.target.value));
                  setShowResults(false);
                }}
              >
                <option value="">Select Track</option>
                {Object.entries(trackDatabase).map(([category, tracks]) => (
                  <optgroup key={category} label={category}>
                    {tracks.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Tune Fix */}
            <div className="lg:col-span-2">
              <label className="block text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Tune Style</label>
              <select 
                className="input-field w-full px-4 py-3 rounded text-white text-sm md:text-base"
                value={selectedTuneFix.code}
                onChange={(e) => {
                  setSelectedTuneFix(tuneFixes.find(t => t.code === e.target.value));
                  setShowResults(false);
                }}
              >
                {tuneFixes.map(t => (
                  <option key={t.code} value={t.code}>{t.name} • {t.description}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div>
              <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider font-semibold">PP Rating</label>
              <input 
                type="number" 
                className="input-field w-full px-3 md:px-4 py-2 md:py-3 rounded text-white stat-font text-base md:text-lg"
                value={pp}
                onChange={(e) => setPp(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider font-semibold">Horsepower</label>
              <input 
                type="number" 
                className="input-field w-full px-3 md:px-4 py-2 md:py-3 rounded text-white stat-font text-base md:text-lg"
                value={hp}
                onChange={(e) => setHp(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider font-semibold">Torque (ft-lb)</label>
              <input 
                type="number" 
                className="input-field w-full px-3 md:px-4 py-2 md:py-3 rounded text-white stat-font text-base md:text-lg"
                value={torque}
                onChange={(e) => setTorque(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider font-semibold">Weight (kg)</label>
              <input 
                type="number" 
                className="input-field w-full px-3 md:px-4 py-2 md:py-3 rounded text-white stat-font text-base md:text-lg"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Ballast */}
          <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-6">
            <div>
              <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider font-semibold">Ballast Weight (kg)</label>
              <input 
                type="number" 
                className="input-field w-full px-4 py-3 rounded text-white text-sm md:text-base"
                value={ballastWeight}
                onChange={(e) => setBallastWeight(Number(e.target.value))}
                min="0"
                max="200"
                step="5"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider font-semibold">Ballast Position (-50 Front to +50 Rear)</label>
              <input 
                type="number" 
                className="input-field w-full px-4 py-3 rounded text-white text-sm md:text-base"
                value={ballastPosition}
                onChange={(e) => setBallastPosition(Number(e.target.value))}
                min="-50"
                max="50"
                step="5"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button 
            onClick={calculateTune}
            disabled={!carData || !selectedTrack}
            className="btn-primary w-full py-4 md:py-5 rounded-lg text-white title-font text-lg md:text-xl relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Wrench className="w-5 h-5 md:w-6 md:h-6" />
              CALCULATE MASTER TUNE
            </span>
          </button>

          {!carData && selectedManufacturer && (
            <div className="mt-4 flex items-center gap-2 text-yellow-500 text-sm">
              <AlertCircle className="w-5 h-5" />
              <p>Please select a vehicle model</p>
            </div>
          )}
          {carData && !selectedTrack && (
            <div className="mt-4 flex items-center gap-2 text-yellow-500 text-sm">
              <AlertCircle className="w-5 h-5" />
              <p>Please select a track</p>
            </div>
          )}
        </div>

        {/* Results */}
        {showResults && results && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Results Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="title-font text-2xl md:text-3xl mb-2">Calculated Setup</h2>
                <p className="text-gray-400 text-sm">
                  {selectedManufacturer} {selectedModel} • {selectedTrack.name} • {selectedTire.code}
                </p>
              </div>
              <button 
                onClick={exportSetup}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-all border border-gray-700 hover:border-gray-600 w-full md:w-auto justify-center"
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Export Setup</span>
              </button>
            </div>

            {/* Adjusted PP & Physics Display */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="panel rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Adjusted PP Rating</p>
                    <p className="stat-font text-3xl md:text-4xl text-[#00ffcc]">{results.adjustedPP}</p>
                    {results.ballast.ppImpact !== 0 && (
                      <p className="text-yellow-500 text-sm mt-1">
                        {results.ballast.ppImpact > 0 ? '+' : ''}{results.ballast.ppImpact} from ballast
                      </p>
                    )}
                  </div>
                  <Gauge className="w-12 h-12 text-[#00ffcc] opacity-30" />
                </div>
              </div>

              <div className="panel rounded-lg p-6">
                <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider">Physics Data</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs">Torque/Weight</p>
                    <p className="stat-font text-xl text-[#00ffcc]">{results.physics.torqueToWeight}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Power/Weight</p>
                    <p className="stat-font text-xl text-[#00ffcc]">{results.physics.powerToWeight}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="result-grid">
              {/* Suspension */}
              <div className="panel rounded-lg p-6">
                <h3 className="title-font text-lg md:text-xl mb-4 pb-2 border-b border-gray-800">Suspension</h3>
                <div className="space-y-3">
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Ride Height (mm)</p>
                    <p className="stat-font text-[#00ffcc] text-lg">F: {results.suspension.height.front} / R: {results.suspension.height.rear}</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Anti-Roll Bar</p>
                    <p className="stat-font text-[#00ffcc] text-lg">F: {results.suspension.antiRoll.front} / R: {results.suspension.antiRoll.rear}</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Damper: Compression</p>
                    <p className="stat-font text-[#00ffcc] text-lg">{results.suspension.compression} / {results.suspension.compression}</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Damper: Expansion</p>
                    <p className="stat-font text-[#00ffcc] text-lg">{results.suspension.expansion} / {results.suspension.expansion}</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Natural Frequency (Hz)</p>
                    <p className="stat-font text-[#00ffcc] text-lg">F: {results.suspension.frequency.front} / R: {results.suspension.frequency.rear}</p>
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div className="panel rounded-lg p-6">
                <h3 className="title-font text-lg md:text-xl mb-4 pb-2 border-b border-gray-800">Alignment</h3>
                <div className="space-y-3">
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Negative Camber (°)</p>
                    <p className="stat-font text-[#00ffcc] text-lg">F: {results.alignment.camber.front} / R: {results.alignment.camber.rear}</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Toe Angle (°)</p>
                    <p className="stat-font text-[#00ffcc] text-lg">
                      F: {results.alignment.toe.front > 0 ? `${results.alignment.toe.front} In` : `${Math.abs(results.alignment.toe.front)} Out`}<br/>
                      R: {results.alignment.toe.rear > 0 ? `${results.alignment.toe.rear} In` : `${Math.abs(results.alignment.toe.rear)} Out`}
                    </p>
                  </div>
                </div>

                <h3 className="title-font text-lg md:text-xl mb-4 mt-6 pb-2 border-b border-gray-800">Aerodynamics</h3>
                <div className="space-y-3">
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Downforce (kgf)</p>
                    <p className="stat-font text-[#00ffcc] text-lg">F: {results.aero.front} / R: {results.aero.rear}</p>
                    <p className="text-gray-500 text-xs mt-1">Balance: {results.aero.balance}% front</p>
                  </div>
                </div>
              </div>

              {/* LSD & Brakes */}
              <div className="panel rounded-lg p-6">
                <h3 className="title-font text-lg md:text-xl mb-4 pb-2 border-b border-gray-800">Differential (LSD)</h3>
                <div className="space-y-3">
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Initial Torque</p>
                    <p className="stat-font text-[#00ffcc] text-lg">{results.lsd.initial}</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Acceleration Sensitivity</p>
                    <p className="stat-font text-[#00ffcc] text-lg">{results.lsd.accel}</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Brake Sensitivity</p>
                    <p className="stat-font text-[#00ffcc] text-lg">{results.lsd.brake}</p>
                  </div>
                </div>

                <h3 className="title-font text-lg md:text-xl mb-4 mt-6 pb-2 border-b border-gray-800">Brakes</h3>
                <div className="space-y-3">
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Brake Balance</p>
                    <p className="stat-font text-[#00ffcc] text-lg">
                      {results.brakeBalance > 0 ? `+${results.brakeBalance} (Front)` : 
                       results.brakeBalance < 0 ? `${results.brakeBalance} (Rear)` : 
                       '0 (Neutral)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transmission */}
              <div className="panel rounded-lg p-6">
                <h3 className="title-font text-lg md:text-xl mb-4 pb-2 border-b border-gray-800">Transmission</h3>
                <div className="space-y-3">
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Top Speed (Auto)</p>
                    <p className="stat-font text-[#00ffcc] text-lg">{results.gearing.topSpeed} km/h</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Final Gear Ratio</p>
                    <p className="stat-font text-[#00ffcc] text-lg">{results.gearing.finalGear}</p>
                  </div>
                  <div className="stat-card p-3 rounded">
                    <p className="text-gray-400 text-xs mb-1">Manual Gear Ratios</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {results.gearing.ratios.map((ratio, i) => (
                        <p key={i} className="text-[#00ffcc] text-xs font-mono">
                          {i + 1}: {ratio.toFixed(3)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ballast Info */}
              {results.ballast.weight > 0 && (
                <div className="panel rounded-lg p-6">
                  <h3 className="title-font text-lg md:text-xl mb-4 pb-2 border-b border-gray-800">Ballast</h3>
                  <div className="space-y-3">
                    <div className="stat-card p-3 rounded">
                      <p className="text-gray-400 text-xs mb-1">Weight</p>
                      <p className="stat-font text-[#00ffcc] text-lg">{results.ballast.weight} kg</p>
                    </div>
                    <div className="stat-card p-3 rounded">
                      <p className="text-gray-400 text-xs mb-1">Position</p>
                      <p className="stat-font text-[#00ffcc] text-lg">
                        {results.ballast.position > 0 ? `+${results.ballast.position} (Rear)` : 
                         results.ballast.position < 0 ? `${results.ballast.position} (Front)` : 
                         '0 (Center)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 border-t border-gray-900">
        <div className="racing-stripe h-1 w-full"></div>
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-xs md:text-sm">
          <p className="mb-1">GT7 Master Tuning Lab • Physics-Based Setup Calculator</p>
          <p>Not affiliated with Polyphony Digital or Sony Interactive Entertainment</p>
          <p className="mt-2 text-gray-700">
            Vehicle database: {vehicleDatabase ? Object.values(vehicleDatabase).reduce((sum, models) => sum + Object.keys(models).length, 0) : 0} cars loaded
          </p>
        </div>
      </div>
    </div>
  );
}
