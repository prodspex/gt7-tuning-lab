#!/usr/bin/env python3
"""
GT7 Vehicle Database Scraper
Collects car data from community sources and generates vehicles.json
"""

import json
import re
import time
from typing import Dict, Any, List
import requests
from bs4 import BeautifulSoup

class GT7Scraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.vehicles = {}
        
    def scrape_kudosprime(self) -> Dict[str, Any]:
        """
        Scrape GT7 car database from Kudosprime
        URL: https://www.kudosprime.com/gt7/carlist.php
        """
        print("🔍 Scraping Kudosprime GT7 database...")
        
        try:
            # Note: This is a template - the actual scraping logic needs to be
            # adapted based on the current structure of the website
            url = "https://www.kudosprime.com/gt7/carlist.php"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Parse car table (structure may vary - this is an example)
            cars_data = {}
            
            # Look for car list table
            table = soup.find('table', {'class': 'carlist'})
            if not table:
                print("⚠️ Could not find car table on Kudosprime")
                return self._get_fallback_data()
            
            rows = table.find_all('tr')[1:]  # Skip header
            
            for row in rows:
                cols = row.find_all('td')
                if len(cols) < 5:
                    continue
                    
                try:
                    # Extract car info (adjust indices based on actual table structure)
                    manufacturer = cols[0].text.strip()
                    model = cols[1].text.strip()
                    drivetrain = cols[2].text.strip()
                    weight = int(re.sub(r'[^\d]', '', cols[3].text))
                    hp = int(re.sub(r'[^\d]', '', cols[4].text))
                    
                    # Organize by manufacturer
                    if manufacturer not in cars_data:
                        cars_data[manufacturer] = {}
                    
                    # Add car with estimated specs
                    cars_data[manufacturer][model] = self._generate_car_specs(
                        drivetrain, weight, hp
                    )
                    
                except (ValueError, IndexError) as e:
                    continue
            
            if cars_data:
                print(f"✅ Successfully scraped {sum(len(v) for v in cars_data.values())} cars")
                return cars_data
            else:
                print("⚠️ No cars found, using fallback data")
                return self._get_fallback_data()
                
        except Exception as e:
            print(f"❌ Error scraping Kudosprime: {e}")
            print("📦 Using fallback database...")
            return self._get_fallback_data()
    
    def scrape_gtplanet(self) -> Dict[str, Any]:
        """
        Scrape GT7 car list from GTplanet forums
        URL: https://www.gtplanet.net/gt7-car-list/
        """
        print("🔍 Scraping GTplanet database...")
        
        try:
            url = "https://www.gtplanet.net/gt7-car-list/"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # GTplanet uses a different structure - adapt as needed
            cars_data = {}
            
            # Look for manufacturer sections
            sections = soup.find_all('div', {'class': 'manufacturer-section'})
            
            for section in sections:
                manufacturer = section.find('h2')
                if not manufacturer:
                    continue
                    
                manufacturer_name = manufacturer.text.strip()
                cars_data[manufacturer_name] = {}
                
                # Find cars under this manufacturer
                car_items = section.find_all('div', {'class': 'car-item'})
                
                for car in car_items:
                    model_elem = car.find('span', {'class': 'model'})
                    if not model_elem:
                        continue
                        
                    model = model_elem.text.strip()
                    
                    # Extract specs if available
                    specs = car.find('div', {'class': 'specs'})
                    if specs:
                        # Parse specs...
                        pass
                    
                    # Use estimated specs
                    cars_data[manufacturer_name][model] = self._generate_car_specs(
                        "FR", 1500, 400  # Defaults
                    )
            
            if cars_data:
                print(f"✅ Successfully scraped {sum(len(v) for v in cars_data.values())} cars from GTplanet")
                return cars_data
            else:
                return {}
                
        except Exception as e:
            print(f"❌ Error scraping GTplanet: {e}")
            return {}
    
    def _generate_car_specs(self, drivetrain: str, weight: int, hp: int) -> Dict[str, Any]:
        """
        Generate realistic car specs based on drivetrain, weight, and power
        """
        # Normalize drivetrain
        drive_map = {
            'FR': 'FR', 'RWD': 'FR', 'Rear': 'FR',
            'MR': 'MR', 'Mid': 'MR',
            'RR': 'RR',
            'FF': 'FF', 'FWD': 'FF', 'Front': 'FF',
            '4WD': '4WD', 'AWD': '4WD', 'All': '4WD'
        }
        drive = drive_map.get(drivetrain.upper(), 'FR')
        
        # Calculate base specs
        power_to_weight = hp / weight
        
        # Suspension ranges (typical GT7 values)
        if power_to_weight > 0.4:  # Race car
            height_range = [50, 100]
            spring_range = [2.0, 16.0]
            base_aero = [200, 600] if drive in ['MR', 'RR'] else [150, 500]
        elif power_to_weight > 0.25:  # Sports car
            height_range = [60, 120]
            spring_range = [1.5, 14.0]
            base_aero = [100, 350]
        else:  # Road car
            height_range = [80, 160]
            spring_range = [1.0, 12.0]
            base_aero = [0, 200]
        
        # Generate gear ratios (simplified - 6-speed default)
        gear_ratios = self._generate_gear_ratios(hp, weight)
        
        # Estimate torque (rough approximation)
        torque = int(hp * 0.85)
        
        return {
            "drive": drive,
            "baseAero": base_aero,
            "heightRange": height_range,
            "springRange": spring_range,
            "damperRange": [1, 10],
            "antiRollRange": [1, 7],
            "camberRange": [-5.0, 0.0],
            "toeRange": [-0.60, 0.60],
            "maxPower": hp,
            "baseWeight": weight,
            "baseTorque": torque,
            "gearRatios": gear_ratios,
            "finalGear": self._calculate_final_gear(hp, weight)
        }
    
    def _generate_gear_ratios(self, hp: int, weight: int) -> List[float]:
        """Generate realistic gear ratios based on car characteristics"""
        power_to_weight = hp / weight
        
        if power_to_weight > 0.4:  # High-performance
            return [3.15, 2.10, 1.57, 1.23, 1.03, 0.88, 0.74]
        elif power_to_weight > 0.25:  # Sports
            return [3.54, 2.06, 1.40, 1.03, 0.82, 0.67]
        else:  # Standard
            return [3.83, 2.36, 1.69, 1.31, 1.10, 0.88]
    
    def _calculate_final_gear(self, hp: int, weight: int) -> float:
        """Calculate appropriate final gear ratio"""
        power_to_weight = hp / weight
        
        if power_to_weight > 0.4:
            return 3.5
        elif power_to_weight > 0.25:
            return 3.9
        else:
            return 4.1
    
    def _get_fallback_data(self) -> Dict[str, Any]:
        """
        Fallback database with popular GT7 cars
        Used when web scraping fails
        """
        print("📦 Loading fallback vehicle database...")
        
        return {
            "Nissan": {
                "GT-R NISMO GT3 '13": {
                    "drive": "FR",
                    "baseAero": [200, 500],
                    "heightRange": [55, 100],
                    "springRange": [2.0, 16.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 600,
                    "baseWeight": 1300,
                    "baseTorque": 510,
                    "gearRatios": [3.827, 2.360, 1.685, 1.312, 1.097, 0.880],
                    "finalGear": 3.7
                },
                "GT-R Premium '17": {
                    "drive": "4WD",
                    "baseAero": [0, 150],
                    "heightRange": [100, 180],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 565,
                    "baseWeight": 1740,
                    "baseTorque": 480,
                    "gearRatios": [4.056, 2.301, 1.595, 1.248, 1.001, 0.796],
                    "finalGear": 3.7
                },
                "Skyline GT-R V-Spec II (R34) '00": {
                    "drive": "4WD",
                    "baseAero": [0, 100],
                    "heightRange": [90, 160],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 280,
                    "baseWeight": 1560,
                    "baseTorque": 289,
                    "gearRatios": [3.827, 2.360, 1.685, 1.312, 1.000, 0.794],
                    "finalGear": 4.111
                }
            },
            "Porsche": {
                "911 RSR '17": {
                    "drive": "MR",
                    "baseAero": [300, 700],
                    "heightRange": [50, 95],
                    "springRange": [2.0, 16.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 510,
                    "baseWeight": 1245,
                    "baseTorque": 434,
                    "gearRatios": [3.150, 2.105, 1.619, 1.320, 1.130, 0.971],
                    "finalGear": 4.0
                },
                "911 GT3 RS '22": {
                    "drive": "RR",
                    "baseAero": [150, 400],
                    "heightRange": [60, 120],
                    "springRange": [1.5, 14.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 525,
                    "baseWeight": 1450,
                    "baseTorque": 346,
                    "gearRatios": [3.461, 2.105, 1.565, 1.229, 1.027, 0.884, 0.774],
                    "finalGear": 3.44
                },
                "911 Carrera RS (964) '92": {
                    "drive": "RR",
                    "baseAero": [0, 80],
                    "heightRange": [80, 140],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 260,
                    "baseWeight": 1230,
                    "baseTorque": 229,
                    "gearRatios": [3.154, 1.789, 1.269, 0.967, 0.756],
                    "finalGear": 3.875
                }
            },
            "Toyota": {
                "GR Corolla '22": {
                    "drive": "4WD",
                    "baseAero": [50, 200],
                    "heightRange": [85, 140],
                    "springRange": [1.0, 10.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 300,
                    "baseWeight": 1475,
                    "baseTorque": 273,
                    "gearRatios": [3.538, 2.060, 1.404, 1.029, 0.820, 0.672],
                    "finalGear": 4.3
                },
                "Supra RZ '97": {
                    "drive": "FR",
                    "baseAero": [0, 150],
                    "heightRange": [90, 160],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 330,
                    "baseWeight": 1520,
                    "baseTorque": 325,
                    "gearRatios": [3.827, 2.360, 1.685, 1.312, 1.000, 0.793],
                    "finalGear": 3.77
                },
                "GR Supra '20": {
                    "drive": "FR",
                    "baseAero": [0, 200],
                    "heightRange": [85, 145],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 335,
                    "baseWeight": 1540,
                    "baseTorque": 369,
                    "gearRatios": [5.000, 3.200, 2.143, 1.720, 1.384, 1.158, 0.971, 0.839],
                    "finalGear": 3.7
                }
            },
            "Mazda": {
                "RX-7 Spirit R Type A (FD) '02": {
                    "drive": "FR",
                    "baseAero": [0, 180],
                    "heightRange": [80, 140],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 280,
                    "baseWeight": 1280,
                    "baseTorque": 231,
                    "gearRatios": [3.483, 2.015, 1.391, 1.031, 0.815, 0.719],
                    "finalGear": 4.1
                },
                "RX-Vision GT3 Concept": {
                    "drive": "FR",
                    "baseAero": [250, 650],
                    "heightRange": [50, 95],
                    "springRange": [2.0, 16.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 562,
                    "baseWeight": 1250,
                    "baseTorque": 478,
                    "gearRatios": [2.950, 2.087, 1.608, 1.296, 1.091, 0.943],
                    "finalGear": 4.3
                },
                "Roadster S (ND) '15": {
                    "drive": "FR",
                    "baseAero": [0, 50],
                    "heightRange": [90, 150],
                    "springRange": [1.0, 10.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 131,
                    "baseWeight": 1010,
                    "baseTorque": 111,
                    "gearRatios": [3.815, 2.260, 1.640, 1.187, 1.000, 0.814],
                    "finalGear": 4.3
                }
            },
            "Honda": {
                "NSX Type R '92": {
                    "drive": "MR",
                    "baseAero": [0, 120],
                    "heightRange": [70, 130],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 280,
                    "baseWeight": 1230,
                    "baseTorque": 210,
                    "gearRatios": [3.071, 1.956, 1.428, 1.125, 0.914, 0.717],
                    "finalGear": 4.06
                },
                "Civic Type R '20": {
                    "drive": "FF",
                    "baseAero": [0, 150],
                    "heightRange": [90, 150],
                    "springRange": [1.0, 10.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 320,
                    "baseWeight": 1390,
                    "baseTorque": 295,
                    "gearRatios": [3.267, 2.130, 1.517, 1.147, 0.921, 0.738],
                    "finalGear": 4.35
                },
                "S2000 '99": {
                    "drive": "FR",
                    "baseAero": [0, 80],
                    "heightRange": [85, 145],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 250,
                    "baseWeight": 1240,
                    "baseTorque": 162,
                    "gearRatios": [3.133, 2.045, 1.481, 1.161, 0.970, 0.811],
                    "finalGear": 4.1
                }
            },
            "Ferrari": {
                "458 Italia '09": {
                    "drive": "MR",
                    "baseAero": [100, 300],
                    "heightRange": [60, 110],
                    "springRange": [1.5, 14.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 570,
                    "baseWeight": 1485,
                    "baseTorque": 398,
                    "gearRatios": [3.077, 2.105, 1.565, 1.229, 1.000, 0.839, 0.667],
                    "finalGear": 4.44
                },
                "F40 '92": {
                    "drive": "MR",
                    "baseAero": [0, 250],
                    "heightRange": [70, 120],
                    "springRange": [1.5, 13.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 478,
                    "baseWeight": 1254,
                    "baseTorque": 425,
                    "gearRatios": [2.769, 1.920, 1.428, 1.129, 0.918],
                    "finalGear": 3.09
                },
                "Enzo Ferrari '02": {
                    "drive": "MR",
                    "baseAero": [120, 380],
                    "heightRange": [55, 105],
                    "springRange": [1.5, 14.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 660,
                    "baseWeight": 1365,
                    "baseTorque": 485,
                    "gearRatios": [2.769, 1.947, 1.522, 1.225, 1.029, 0.886],
                    "finalGear": 4.44
                }
            },
            "Lamborghini": {
                "Huracán LP 610-4 '15": {
                    "drive": "4WD",
                    "baseAero": [120, 350],
                    "heightRange": [65, 115],
                    "springRange": [1.5, 14.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 610,
                    "baseWeight": 1422,
                    "baseTorque": 413,
                    "gearRatios": [3.091, 2.105, 1.565, 1.229, 1.027, 0.884, 0.742],
                    "finalGear": 3.91
                },
                "Countach LP400 '74": {
                    "drive": "MR",
                    "baseAero": [0, 100],
                    "heightRange": [75, 130],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 375,
                    "baseWeight": 1065,
                    "baseTorque": 268,
                    "gearRatios": [2.538, 1.652, 1.222, 0.969, 0.815],
                    "finalGear": 4.09
                },
                "Aventador LP 750-4 Superveloce '15": {
                    "drive": "4WD",
                    "baseAero": [150, 450],
                    "heightRange": [60, 110],
                    "springRange": [1.5, 14.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 750,
                    "baseWeight": 1525,
                    "baseTorque": 509,
                    "gearRatios": [3.091, 2.105, 1.565, 1.229, 1.027, 0.884, 0.742],
                    "finalGear": 3.91
                }
            },
            "BMW": {
                "M4 Coupé '14": {
                    "drive": "FR",
                    "baseAero": [0, 180],
                    "heightRange": [85, 140],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 431,
                    "baseWeight": 1585,
                    "baseTorque": 406,
                    "gearRatios": [4.056, 2.396, 1.641, 1.213, 1.000, 0.846, 0.672],
                    "finalGear": 3.15
                },
                "M3 Sport Evolution '89": {
                    "drive": "FR",
                    "baseAero": [0, 120],
                    "heightRange": [90, 150],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 238,
                    "baseWeight": 1200,
                    "baseTorque": 177,
                    "gearRatios": [3.72, 2.40, 1.77, 1.26, 1.00],
                    "finalGear": 4.45
                },
                "Z4 GT3 '11": {
                    "drive": "FR",
                    "baseAero": [200, 550],
                    "heightRange": [50, 100],
                    "springRange": [2.0, 16.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 480,
                    "baseWeight": 1280,
                    "baseTorque": 408,
                    "gearRatios": [3.307, 2.269, 1.645, 1.257, 1.000, 0.838],
                    "finalGear": 3.73
                }
            },
            "Subaru": {
                "WRX STI Type S '14": {
                    "drive": "4WD",
                    "baseAero": [0, 150],
                    "heightRange": [95, 160],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 308,
                    "baseWeight": 1490,
                    "baseTorque": 290,
                    "gearRatios": [3.636, 2.375, 1.761, 1.346, 1.062, 0.842],
                    "finalGear": 3.90
                },
                "BRZ S '15": {
                    "drive": "FR",
                    "baseAero": [0, 100],
                    "heightRange": [90, 150],
                    "springRange": [1.0, 10.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 200,
                    "baseWeight": 1239,
                    "baseTorque": 151,
                    "gearRatios": [3.626, 2.188, 1.541, 1.213, 1.000, 0.767],
                    "finalGear": 4.3
                },
                "Impreza 22B-STi Version '98": {
                    "drive": "4WD",
                    "baseAero": [0, 100],
                    "heightRange": [95, 160],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 280,
                    "baseWeight": 1270,
                    "baseTorque": 268,
                    "gearRatios": [3.166, 1.882, 1.296, 0.972, 0.738],
                    "finalGear": 3.90
                }
            },
            "McLaren": {
                "F1 GTR - BMW '97": {
                    "drive": "MR",
                    "baseAero": [250, 650],
                    "heightRange": [50, 95],
                    "springRange": [2.0, 16.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 600,
                    "baseWeight": 1000,
                    "baseTorque": 510,
                    "gearRatios": [2.615, 1.842, 1.407, 1.138, 0.943, 0.800],
                    "finalGear": 3.11
                },
                "MP4-12C '10": {
                    "drive": "MR",
                    "baseAero": [100, 320],
                    "heightRange": [60, 115],
                    "springRange": [1.5, 14.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 600,
                    "baseWeight": 1434,
                    "baseTorque": 443,
                    "gearRatios": [3.143, 2.105, 1.565, 1.229, 1.027, 0.884, 0.742],
                    "finalGear": 3.72
                }
            },
            "Audi": {
                "R8 4.2 FSI R tronic '07": {
                    "drive": "4WD",
                    "baseAero": [0, 200],
                    "heightRange": [80, 135],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 420,
                    "baseWeight": 1560,
                    "baseTorque": 317,
                    "gearRatios": [3.307, 2.053, 1.481, 1.138, 0.914, 0.757],
                    "finalGear": 4.06
                },
                "TT Coupe 3.2 quattro '03": {
                    "drive": "4WD",
                    "baseAero": [0, 100],
                    "heightRange": [90, 150],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 250,
                    "baseWeight": 1450,
                    "baseTorque": 236,
                    "gearRatios": [3.667, 2.050, 1.400, 1.029, 0.829, 0.686],
                    "finalGear": 3.65
                }
            },
            "Mercedes-Benz": {
                "AMG GT S '15": {
                    "drive": "FR",
                    "baseAero": [0, 220],
                    "heightRange": [75, 130],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 510,
                    "baseWeight": 1645,
                    "baseTorque": 479,
                    "gearRatios": [4.171, 2.652, 1.842, 1.391, 1.130, 0.952, 0.803],
                    "finalGear": 3.538
                },
                "SLS AMG '10": {
                    "drive": "FR",
                    "baseAero": [0, 200],
                    "heightRange": [75, 130],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 571,
                    "baseWeight": 1620,
                    "baseTorque": 479,
                    "gearRatios": [3.909, 2.346, 1.556, 1.156, 0.916, 0.742, 0.623],
                    "finalGear": 3.07
                }
            },
            "Chevrolet": {
                "Corvette C7 Z06 '15": {
                    "drive": "FR",
                    "baseAero": [0, 250],
                    "heightRange": [75, 130],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 659,
                    "baseWeight": 1634,
                    "baseTorque": 623,
                    "gearRatios": [2.66, 1.78, 1.30, 1.00, 0.84, 0.69, 0.57],
                    "finalGear": 3.42
                },
                "Camaro Z28 '69": {
                    "drive": "FR",
                    "baseAero": [0, 50],
                    "heightRange": [100, 170],
                    "springRange": [1.0, 10.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 290,
                    "baseWeight": 1600,
                    "baseTorque": 407,
                    "gearRatios": [2.52, 1.88, 1.46, 1.00],
                    "finalGear": 3.73
                }
            },
            "Ford": {
                "GT '17": {
                    "drive": "MR",
                    "baseAero": [150, 400],
                    "heightRange": [60, 110],
                    "springRange": [1.5, 14.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 647,
                    "baseWeight": 1385,
                    "baseTorque": 550,
                    "gearRatios": [3.067, 2.000, 1.457, 1.133, 0.914, 0.757, 0.646],
                    "finalGear": 3.75
                },
                "Mustang GT '15": {
                    "drive": "FR",
                    "baseAero": [0, 150],
                    "heightRange": [90, 150],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 435,
                    "baseWeight": 1705,
                    "baseTorque": 400,
                    "gearRatios": [3.664, 2.427, 1.815, 1.376, 1.000, 0.794],
                    "finalGear": 3.55
                }
            },
            "Dodge": {
                "Viper GTS '02": {
                    "drive": "FR",
                    "baseAero": [0, 180],
                    "heightRange": [80, 135],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 450,
                    "baseWeight": 1545,
                    "baseTorque": 490,
                    "gearRatios": [2.66, 1.78, 1.30, 1.00, 0.74, 0.50],
                    "finalGear": 3.07
                }
            },
            "Volkswagen": {
                "Golf VII GTI '14": {
                    "drive": "FF",
                    "baseAero": [0, 100],
                    "heightRange": [95, 155],
                    "springRange": [1.0, 10.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 230,
                    "baseWeight": 1395,
                    "baseTorque": 258,
                    "gearRatios": [3.778, 2.118, 1.360, 0.969, 0.778, 0.646],
                    "finalGear": 3.65
                }
            },
            "Mitsubishi": {
                "Lancer Evolution Final Edition '15": {
                    "drive": "4WD",
                    "baseAero": [0, 150],
                    "heightRange": [95, 160],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 303,
                    "baseWeight": 1540,
                    "baseTorque": 305,
                    "gearRatios": [3.266, 1.956, 1.407, 1.031, 0.815, 0.652],
                    "finalGear": 4.529
                }
            },
            "Alfa Romeo": {
                "4C '14": {
                    "drive": "MR",
                    "baseAero": [0, 150],
                    "heightRange": [75, 130],
                    "springRange": [1.0, 11.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 240,
                    "baseWeight": 1050,
                    "baseTorque": 258,
                    "gearRatios": [3.714, 2.238, 1.520, 1.156, 0.971, 0.795],
                    "finalGear": 4.15
                }
            },
            "Aston Martin": {
                "DB11 '16": {
                    "drive": "FR",
                    "baseAero": [0, 200],
                    "heightRange": [80, 135],
                    "springRange": [1.0, 12.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 608,
                    "baseWeight": 1770,
                    "baseTorque": 516,
                    "gearRatios": [4.714, 3.143, 2.106, 1.667, 1.285, 1.000, 0.839, 0.667],
                    "finalGear": 3.15
                },
                "Vantage Gr.4": {
                    "drive": "FR",
                    "baseAero": [200, 550],
                    "heightRange": [50, 100],
                    "springRange": [2.0, 16.0],
                    "damperRange": [1, 10],
                    "antiRollRange": [1, 7],
                    "camberRange": [-5.0, 0.0],
                    "toeRange": [-0.60, 0.60],
                    "maxPower": 430,
                    "baseWeight": 1300,
                    "baseTorque": 366,
                    "gearRatios": [3.333, 2.286, 1.714, 1.333, 1.071, 0.905],
                    "finalGear": 3.73
                }
            }
        }
    
    def merge_databases(self, *sources: Dict[str, Any]) -> Dict[str, Any]:
        """Merge multiple data sources, preferring newer data"""
        merged = {}
        
        for source in sources:
            for manufacturer, models in source.items():
                if manufacturer not in merged:
                    merged[manufacturer] = {}
                merged[manufacturer].update(models)
        
        return merged
    
    def save_database(self, vehicles: Dict[str, Any], output_path: str = "public/vehicles.json"):
        """Save vehicle database to JSON file"""
        import os
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Add metadata
        output = {
            "metadata": {
                "version": "1.0",
                "last_updated": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
                "total_manufacturers": len(vehicles),
                "total_vehicles": sum(len(models) for models in vehicles.values()),
                "source": "GT7 Community Databases + Fallback Data"
            },
            "vehicles": vehicles
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Database saved to {output_path}")
        print(f"📊 Total: {output['metadata']['total_vehicles']} vehicles from {output['metadata']['total_manufacturers']} manufacturers")
    
    def run(self):
        """Main scraping workflow"""
        print("🏁 GT7 Vehicle Database Scraper Starting...")
        print("=" * 60)
        
        # Try multiple sources
        sources = []
        
        # Source 1: Kudosprime
        kudos_data = self.scrape_kudosprime()
        if kudos_data:
            sources.append(kudos_data)
        
        time.sleep(2)  # Be respectful to servers
        
        # Source 2: GTplanet
        gtplanet_data = self.scrape_gtplanet()
        if gtplanet_data:
            sources.append(gtplanet_data)
        
        # Merge all sources
        if sources:
            final_database = self.merge_databases(*sources)
        else:
            print("⚠️ All web sources failed, using fallback only")
            final_database = self._get_fallback_data()
        
        # Save to file
        self.save_database(final_database)
        
        print("=" * 60)
        print("🎉 Scraping complete!")
        
        return final_database


def main():
    scraper = GT7Scraper()
    scraper.run()


if __name__ == "__main__":
    main()
