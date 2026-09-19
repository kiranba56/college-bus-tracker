/**
 * College Bus Routes & Telemetry for Jain Institute of Technology (JIT), Davangere
 * Campus Location: Near Bada Cross, PB Road, Davangere, Karnataka
 * 
 * College Schedule:
 * - Starts at: 09:00 AM (Buses pick up students and arrive at JIT by 08:50 AM)
 * - Ends at: 05:00 PM (Buses depart JIT at 05:15 PM after dispersal)
 * 
 * 4 Specific Routes:
 * 1. Vidyanagar to JIT Campus (near Bada Cross)
 * 2. BIET to JIT Campus (near Bada Cross)
 * 3. Harihara to JIT Campus (near Bada Cross)
 * 4. Channagiri to JIT Campus (near Bada Cross)
 */

export const INITIAL_ROUTES = [
  {
    id: "route-101",
    routeNumber: "101",
    name: "Vidyanagar to JIT Campus",
    color: "#2563EB", // Royal Blue
    description: "Daily college transit from Vidyanagar via PJ Extension, Bus Stand, Kuvempu Nagar to JIT near Bada Cross",
    collegeHours: "09:00 AM - 05:00 PM",
    operatingHours: "Morning: 08:05 AM - 08:50 AM | Evening: 05:15 PM - 05:55 PM",
    frequency: "Morning Inbound & Evening Dispersal",
    stops: [
      { id: "s101-1", name: "Vidyanagar Water Tank", lat: 14.4575, lng: 75.9125, order: 1, scheduledTime: "08:10 AM", morningPickup: "08:10 AM", eveningDrop: "05:45 PM" },
      { id: "s101-2", name: "Jayadeva Circle (PJ Extension)", lat: 14.4625, lng: 75.9180, order: 2, scheduledTime: "08:20 AM", morningPickup: "08:20 AM", eveningDrop: "05:38 PM" },
      { id: "s101-3", name: "Davangere KSRTC Bus Stand", lat: 14.4645, lng: 75.9245, order: 3, scheduledTime: "08:28 AM", morningPickup: "08:28 AM", eveningDrop: "05:32 PM" },
      { id: "s101-4", name: "Dental College / Kuvempu Nagar", lat: 14.4530, lng: 75.9380, order: 4, scheduledTime: "08:38 AM", morningPickup: "08:38 AM", eveningDrop: "05:25 PM" },
      { id: "s101-5", name: "Bada Cross Highway Junction", lat: 14.4390, lng: 75.9590, order: 5, scheduledTime: "08:46 AM", morningPickup: "08:46 AM", eveningDrop: "05:18 PM" },
      { id: "s101-6", name: "JIT Main Campus Gate", lat: 14.4365, lng: 75.9620, order: 6, scheduledTime: "08:50 AM", morningPickup: "08:50 AM", eveningDrop: "05:15 PM (Dep)" },
    ],
    waypoints: [
      { lat: 14.4575, lng: 75.9125 }, // s101-1: Vidyanagar
      { lat: 14.4595, lng: 75.9150 },
      { lat: 14.4610, lng: 75.9168 },
      { lat: 14.4625, lng: 75.9180 }, // s101-2: Jayadeva Circle
      { lat: 14.4635, lng: 75.9210 },
      { lat: 14.4645, lng: 75.9245 }, // s101-3: KSRTC
      { lat: 14.4610, lng: 75.9290 },
      { lat: 14.4570, lng: 75.9335 },
      { lat: 14.4530, lng: 75.9380 }, // s101-4: Kuvempu Nagar
      { lat: 14.4490, lng: 75.9440 },
      { lat: 14.4440, lng: 75.9515 },
      { lat: 14.4390, lng: 75.9590 }, // s101-5: Bada Cross
      { lat: 14.4365, lng: 75.9620 }, // s101-6: JIT Campus
      // Return path
      { lat: 14.4385, lng: 75.9580 },
      { lat: 14.4470, lng: 75.9460 },
      { lat: 14.4560, lng: 75.9320 },
      { lat: 14.4600, lng: 75.9220 },
    ],
    bus: {
      id: "bus-01",
      busNumber: "JIT Bus 01",
      plateNumber: "KA-17-F-4011",
      driverName: "Manjunath Patil",
      driverPhone: "+91 98450 12345",
      capacity: 52,
      passengers: 34,
      status: "In Transit",
      speed: 34,
      heading: 140,
      lat: 14.4625,
      lng: 75.9180,
      nextStopId: "s101-3",
      currentWaypointIndex: 3,
      isSimulated: true,
      simulationSpeed: 1,
      trafficStatus: "Normal",
    },
  },
  {
    id: "route-202",
    routeNumber: "202",
    name: "BIET to JIT Campus",
    color: "#10B981", // Emerald Green
    description: "Connects BIET College, Shamnur Circle & MCC B-Block across South Ring Road to JIT near Bada Cross",
    collegeHours: "09:00 AM - 05:00 PM",
    operatingHours: "Morning: 08:10 AM - 08:50 AM | Evening: 05:15 PM - 05:55 PM",
    frequency: "Morning Inbound & Evening Dispersal",
    stops: [
      { id: "s202-1", name: "BIET Main Gate (Shamnur Rd)", lat: 14.4485, lng: 75.8990, order: 1, scheduledTime: "08:12 AM", morningPickup: "08:12 AM", eveningDrop: "05:46 PM" },
      { id: "s202-2", name: "Shamnur Circle", lat: 14.4440, lng: 75.9080, order: 2, scheduledTime: "08:20 AM", morningPickup: "08:20 AM", eveningDrop: "05:39 PM" },
      { id: "s202-3", name: "MCC 'B' Block Bapuji Hospital", lat: 14.4520, lng: 75.9180, order: 3, scheduledTime: "08:28 AM", morningPickup: "08:28 AM", eveningDrop: "05:32 PM" },
      { id: "s202-4", name: "South Ring Road Cross", lat: 14.4460, lng: 75.9380, order: 4, scheduledTime: "08:38 AM", morningPickup: "08:38 AM", eveningDrop: "05:24 PM" },
      { id: "s202-5", name: "Bada Village Toll Cross", lat: 14.4380, lng: 75.9570, order: 5, scheduledTime: "08:46 AM", morningPickup: "08:46 AM", eveningDrop: "05:18 PM" },
      { id: "s202-6", name: "JIT Admin Block", lat: 14.4365, lng: 75.9620, order: 6, scheduledTime: "08:50 AM", morningPickup: "08:50 AM", eveningDrop: "05:15 PM (Dep)" },
    ],
    waypoints: [
      { lat: 14.4485, lng: 75.8990 }, // s202-1: BIET
      { lat: 14.4462, lng: 75.9035 },
      { lat: 14.4440, lng: 75.9080 }, // s202-2: Shamnur
      { lat: 14.4480, lng: 75.9130 },
      { lat: 14.4520, lng: 75.9180 }, // s202-3: MCC B Block
      { lat: 14.4490, lng: 75.9280 },
      { lat: 14.4460, lng: 75.9380 }, // s202-4: South Ring Road
      { lat: 14.4420, lng: 75.9475 },
      { lat: 14.4380, lng: 75.9570 }, // s202-5: Bada Village
      { lat: 14.4365, lng: 75.9620 }, // s202-6: JIT Campus
      // Return path
      { lat: 14.4410, lng: 75.9500 },
      { lat: 14.4470, lng: 75.9320 },
      { lat: 14.4460, lng: 75.9100 },
    ],
    bus: {
      id: "bus-02",
      busNumber: "JIT Bus 04",
      plateNumber: "KA-17-E-8822",
      driverName: "Suresh Gowda",
      driverPhone: "+91 97401 54321",
      capacity: 55,
      passengers: 41,
      status: "In Transit",
      speed: 38,
      heading: 125,
      lat: 14.4520,
      lng: 75.9180,
      nextStopId: "s202-4",
      currentWaypointIndex: 4,
      isSimulated: true,
      simulationSpeed: 1,
      trafficStatus: "Normal",
    },
  },
  {
    id: "route-303",
    routeNumber: "303",
    name: "Harihara to JIT Campus",
    color: "#F59E0B", // Amber
    description: "Express route starting from Harihara town via Shimoga Cross, Davangere Bypass & Avaragere to JIT near Bada Cross",
    collegeHours: "09:00 AM - 05:00 PM",
    operatingHours: "Morning: 07:50 AM - 08:50 AM | Evening: 05:15 PM - 06:10 PM",
    frequency: "Morning Inbound & Evening Dispersal",
    stops: [
      { id: "s303-1", name: "Harihara KSRTC Bus Stand", lat: 14.5150, lng: 75.8050, order: 1, scheduledTime: "07:50 AM", morningPickup: "07:50 AM", eveningDrop: "06:05 PM" },
      { id: "s303-2", name: "Harihara Shimoga Circle", lat: 14.5020, lng: 75.8250, order: 2, scheduledTime: "08:02 AM", morningPickup: "08:02 AM", eveningDrop: "05:54 PM" },
      { id: "s303-3", name: "Amaravathi Colony Cross", lat: 14.4880, lng: 75.8580, order: 3, scheduledTime: "08:15 AM", morningPickup: "08:15 AM", eveningDrop: "05:43 PM" },
      { id: "s303-4", name: "Shabanur Bypass Cross", lat: 14.4750, lng: 75.9150, order: 4, scheduledTime: "08:28 AM", morningPickup: "08:28 AM", eveningDrop: "05:32 PM" },
      { id: "s303-5", name: "Old PB Road / Avaragere", lat: 14.4520, lng: 75.9480, order: 5, scheduledTime: "08:40 AM", morningPickup: "08:40 AM", eveningDrop: "05:23 PM" },
      { id: "s303-6", name: "JIT Campus Gate (Bada Cross)", lat: 14.4365, lng: 75.9620, order: 6, scheduledTime: "08:50 AM", morningPickup: "08:50 AM", eveningDrop: "05:15 PM (Dep)" },
    ],
    waypoints: [
      { lat: 14.5150, lng: 75.8050 }, // s303-1: Harihara
      { lat: 14.5085, lng: 75.8150 },
      { lat: 14.5020, lng: 75.8250 }, // s303-2: Shimoga Circle
      { lat: 14.4950, lng: 75.8415 },
      { lat: 14.4880, lng: 75.8580 }, // s303-3: Amaravathi
      { lat: 14.4815, lng: 75.8865 },
      { lat: 14.4750, lng: 75.9150 }, // s303-4: Shabanur Bypass
      { lat: 14.4635, lng: 75.9315 },
      { lat: 14.4520, lng: 75.9480 }, // s303-5: Avaragere
      { lat: 14.4442, lng: 75.9550 },
      { lat: 14.4365, lng: 75.9620 }, // s303-6: JIT Campus
      // Return path
      { lat: 14.4500, lng: 75.9420 },
      { lat: 14.4720, lng: 75.9100 },
      { lat: 14.4920, lng: 75.8450 },
    ],
    bus: {
      id: "bus-03",
      busNumber: "JIT Bus 09",
      plateNumber: "KA-17-F-7711",
      driverName: "Basavarajappa",
      driverPhone: "+91 99802 88776",
      capacity: 55,
      passengers: 46,
      status: "In Transit",
      speed: 42,
      heading: 130,
      lat: 14.4750,
      lng: 75.9150,
      nextStopId: "s303-5",
      currentWaypointIndex: 6,
      isSimulated: true,
      simulationSpeed: 1,
      trafficStatus: "Normal",
    },
  },
  {
    id: "route-404",
    routeNumber: "404",
    name: "Channagiri to JIT Campus",
    color: "#8B5CF6", // Purple
    description: "South-East corridor starting from Channagiri town via Santhebennur, Bilichodu and Tolahunse to JIT near Bada Cross",
    collegeHours: "09:00 AM - 05:00 PM",
    operatingHours: "Morning: 07:35 AM - 08:50 AM | Evening: 05:15 PM - 06:25 PM",
    frequency: "Morning Inbound & Evening Dispersal",
    stops: [
      { id: "s404-1", name: "Channagiri KSRTC Bus Depot", lat: 14.3000, lng: 75.9300, order: 1, scheduledTime: "07:35 AM", morningPickup: "07:35 AM", eveningDrop: "06:20 PM" },
      { id: "s404-2", name: "Santhebennur Main Circle", lat: 14.3400, lng: 75.9420, order: 2, scheduledTime: "07:55 AM", morningPickup: "07:55 AM", eveningDrop: "06:02 PM" },
      { id: "s404-3", name: "Bilichodu Cross", lat: 14.3750, lng: 75.9520, order: 3, scheduledTime: "08:12 AM", morningPickup: "08:12 AM", eveningDrop: "05:46 PM" },
      { id: "s404-4", name: "Tolahunse Highway Junction", lat: 14.4100, lng: 75.9600, order: 4, scheduledTime: "08:30 AM", morningPickup: "08:30 AM", eveningDrop: "05:31 PM" },
      { id: "s404-5", name: "Bada Cross South Checkpost", lat: 14.4320, lng: 75.9610, order: 5, scheduledTime: "08:44 AM", morningPickup: "08:44 AM", eveningDrop: "05:18 PM" },
      { id: "s404-6", name: "JIT Main Campus Entrance", lat: 14.4365, lng: 75.9620, order: 6, scheduledTime: "08:50 AM", morningPickup: "08:50 AM", eveningDrop: "05:15 PM (Dep)" },
    ],
    waypoints: [
      { lat: 14.3000, lng: 75.9300 }, // s404-1: Channagiri
      { lat: 14.3200, lng: 75.9360 },
      { lat: 14.3400, lng: 75.9420 }, // s404-2: Santhebennur
      { lat: 14.3575, lng: 75.9470 },
      { lat: 14.3750, lng: 75.9520 }, // s404-3: Bilichodu
      { lat: 14.3925, lng: 75.9560 },
      { lat: 14.4100, lng: 75.9600 }, // s404-4: Tolahunse
      { lat: 14.4210, lng: 75.9605 },
      { lat: 14.4320, lng: 75.9610 }, // s404-5: Bada Cross
      { lat: 14.4365, lng: 75.9620 }, // s404-6: JIT Campus
      // Return path
      { lat: 14.4200, lng: 75.9580 },
      { lat: 14.3800, lng: 75.9500 },
      { lat: 14.3300, lng: 75.9380 },
    ],
    bus: {
      id: "bus-04",
      busNumber: "JIT Bus 15",
      plateNumber: "KA-17-F-9104",
      driverName: "Praveen Kumar",
      driverPhone: "+91 96112 45890",
      capacity: 52,
      passengers: 37,
      status: "In Transit",
      speed: 44,
      heading: 15,
      lat: 14.4100,
      lng: 75.9600,
      nextStopId: "s404-5",
      currentWaypointIndex: 6,
      isSimulated: true,
      simulationSpeed: 1,
      trafficStatus: "Normal",
    },
  },
];

export const INITIAL_ALERTS = [
  {
    id: "alert-1",
    type: "info",
    title: "College Timings: 09:00 AM - 05:00 PM Active",
    message: "Morning buses arrive at JIT Bada Cross by 08:50 AM. Evening dispersal departures commence at 05:15 PM.",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    routeId: null,
  },
  {
    id: "alert-2",
    type: "warning",
    title: "Bada Cross NH-48 Traffic Advisory",
    message: "Smooth highway flow near Bada Cross. All buses on schedule to reach JIT before 09:00 AM.",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    routeId: null,
  },
];
