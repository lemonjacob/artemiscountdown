export const LAUNCH_DATE = '2026-04-01T22:24:00Z'

export const NASA_STREAMS = [
  'NaJklsJonD4', 'Tf_UjBMIzNo'
] as const

export type MissionPhase = 'prelaunch' | 'postlaunch'

export type MissionTag = 'tanking' | 'terminal-count'

export interface MissionEvent {
  id: string
  phase: MissionPhase
  title: string
  description: string
  offsetLabel: string
  offsetSeconds: number
  endOffsetSeconds?: number
  tag?: MissionTag
}

interface RawMissionEvent {
  offset: string
  endOffset?: string
  title: string
  description: string
  tag?: MissionTag
}

const slugify = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

const parseOffsetSeconds = (offset: string) => {
  const sign = offset.startsWith('-') ? -1 : 1
  const normalized = offset.replace(/^[+-]/, '')
  const [rawDayPart, rawTimePart] = normalized.includes('/')
    ? normalized.split('/')
    : ['0', normalized]

  const dayPart = rawDayPart ?? '0'
  const timePart = rawTimePart ?? normalized
  const parts = timePart.split(':').map(part => Number.parseInt(part, 10))

  if (parts.some(Number.isNaN) || (parts.length !== 2 && parts.length !== 3)) {
    throw new Error(`Unsupported mission offset format: ${offset}`)
  }

  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  const seconds = parts[2] ?? 0
  const days = Number.parseInt(dayPart, 10)

  return sign * (((days * 24 + hours) * 60 + minutes) * 60 + seconds)
}

const toMissionEvent = (phase: MissionPhase, event: RawMissionEvent): MissionEvent => ({
  id: `${phase}-${slugify(event.offset)}-${slugify(event.title)}`,
  phase,
  title: event.title,
  description: event.description,
  offsetLabel: event.offset,
  offsetSeconds: parseOffsetSeconds(event.offset),
  ...(event.endOffset !== undefined ? { endOffsetSeconds: parseOffsetSeconds(event.endOffset) } : {}),
  ...(event.tag !== undefined ? { tag: event.tag } : {})
})

const PRE_LAUNCH_RAW: RawMissionEvent[] = [
  // L-49 hours 50 minutes and counting
  {
    offset: '-49:50:00',
    title: 'Launch team arrives to stations',
    description: 'The Artemis II launch team reports to their consoles in Firing Room 1 at Kennedy Space Center.'
  },
  {
    offset: '-49:40:00',
    title: 'Countdown clock begins',
    description: 'The official countdown clock starts ticking toward the planned liftoff time.'
  },
  {
    offset: '-49:39:00',
    endOffset: '-42:30:00',
    title: 'LOX/LH2 system preparations',
    description: 'Liquid oxygen and liquid hydrogen system preparations begin for vehicle loading.'
  },
  {
    offset: '-45:30:00',
    endOffset: '-44:00:00',
    title: 'Orion spacecraft powered up',
    description: 'The Orion crew module is powered up and brought online for pre-flight checkout.'
  },
  {
    offset: '-42:20:00',
    endOffset: '-41:00:00',
    title: 'Core stage powered up',
    description: 'The SLS core stage is powered up for system checks.'
  },
  {
    offset: '-42:10:00',
    endOffset: '-40:30:00',
    title: 'ICPS powered up',
    description: 'The interim cryogenic propulsion stage is powered up for pre-launch verification.'
  },
  {
    offset: '-39:45:00',
    endOffset: '-35:30:00',
    title: 'RS-25 engine final preparations',
    description: 'Final preparations of the four RS-25 engines begin.'
  },
  // L-35 hours and counting
  {
    offset: '-34:45:00',
    endOffset: '-34:10:00',
    title: 'ICPS is powered down',
    description: 'The ICPS is powered down following initial checkout.'
  },
  {
    offset: '-33:30:00',
    endOffset: '-29:30:00',
    title: 'Charge Orion flight batteries',
    description: 'Orion flight batteries are charged to 100% for mission operations.'
  },
  {
    offset: '-31:30:00',
    endOffset: '-24:30:00',
    title: 'Charge core stage flight batteries',
    description: 'Core stage flight batteries are charged ahead of propellant loading.'
  },
  {
    offset: '-20:15:00',
    endOffset: '-18:45:00',
    title: 'ICPS powered up for launch',
    description: 'The ICPS is powered back up in its launch configuration.'
  },
  // L-16 hours and counting
  {
    offset: '-15:30:00',
    endOffset: '-14:00:00',
    title: 'Non-essential personnel leave LC 39B',
    description: 'All non-essential personnel depart Launch Complex 39B as hazardous operations approach.'
  },
  {
    offset: '-14:15:00',
    endOffset: '-12:05:00',
    title: 'Air-to-GN2 changeover and cavity inerting',
    description: 'Air-to-gaseous nitrogen changeover begins and the rocket cavity is inerted for safety.'
  },
  {
    offset: '-13:15:00',
    endOffset: '-11:45:00',
    title: 'Ground launch sequencer activation',
    description: 'The ground launch sequencer (GLS) is brought online to manage the automated countdown.'
  },
  // L-13 hours and counting
  {
    offset: '-12:35:00',
    endOffset: '-09:50:00',
    title: 'Built-in countdown hold (2h 45m)',
    description: 'A planned 2-hour 45-minute hold begins at T-8:10:00, providing schedule margin before tanking.'
  },
  {
    offset: '-10:50:00',
    title: 'Go/no-go for tanking',
    description: 'The launch team decides go or no-go to begin cryogenic propellant loading.',
    tag: 'tanking'
  },
  {
    offset: '-10:49:00',
    endOffset: '-09:35:00',
    title: 'Orion cold soak',
    description: 'Orion enters a cold soak phase in preparation for propellant loading operations.'
  },
  {
    offset: '-10:40:00',
    endOffset: '-10:35:00',
    title: 'Core stage LOX transfer line chilldown',
    description: 'The core stage liquid oxygen transfer line is chilled down to cryogenic temperatures.',
    tag: 'tanking'
  },
  {
    offset: '-10:39:00',
    endOffset: '-09:55:00',
    title: 'Core stage LH2 chilldown',
    description: 'The core stage liquid hydrogen systems are chilled in preparation for propellant fill.',
    tag: 'tanking'
  },
  {
    offset: '-10:25:00',
    endOffset: '-09:40:00',
    title: 'Core stage LOX MPS chilldown',
    description: 'The core stage liquid oxygen main propulsion system is chilled to operating temperature.',
    tag: 'tanking'
  },
  // L-10 hours and counting
  {
    offset: '-09:55:00',
    endOffset: '-09:25:00',
    title: 'Core stage LH2 slow fill',
    description: 'Liquid hydrogen slow fill begins on the core stage to gradually cool the tank.',
    tag: 'tanking'
  },
  {
    offset: '-09:50:00',
    title: 'Resume T-clock from T-8H10M',
    description: 'The terminal countdown clock resumes from the T-8:10:00 mark after the built-in hold.'
  },
  {
    offset: '-09:40:00',
    endOffset: '-09:30:00',
    title: 'Core stage LOX slow fill',
    description: 'Liquid oxygen slow fill begins on the core stage.',
    tag: 'tanking'
  },
  {
    offset: '-09:30:00',
    endOffset: '-06:40:00',
    title: 'Core stage LOX fast fill',
    description: 'Core stage liquid oxygen transitions to fast fill rate for bulk loading.',
    tag: 'tanking'
  },
  {
    offset: '-09:25:00',
    endOffset: '-08:00:00',
    title: 'Core stage LH2 fast fill',
    description: 'Core stage liquid hydrogen transitions to fast fill rate.',
    tag: 'tanking'
  },
  {
    offset: '-09:05:00',
    endOffset: '-08:30:00',
    title: 'ICPS LH2 chilldown',
    description: 'The ICPS liquid hydrogen system is chilled down to cryogenic temperatures.',
    tag: 'tanking'
  },
  {
    offset: '-08:30:00',
    endOffset: '-07:45:00',
    title: 'ICPS LH2 fast fill',
    description: 'ICPS liquid hydrogen fast fill begins.',
    tag: 'tanking'
  },
  {
    offset: '-08:00:00',
    endOffset: '-07:55:00',
    title: 'Core stage LH2 topping',
    description: 'Core stage liquid hydrogen tank transitions to topping mode.',
    tag: 'tanking'
  },
  {
    offset: '-07:55:00',
    endOffset: '00:00:00',
    title: 'Core stage LH2 replenish',
    description: 'Core stage liquid hydrogen enters continuous replenish mode through terminal count.',
    tag: 'tanking'
  },
  {
    offset: '-07:45:00',
    endOffset: '-07:20:00',
    title: 'ICPS LH2 vent and relief test',
    description: 'The ICPS liquid hydrogen vent and relief valves are tested.',
    tag: 'tanking'
  },
  {
    offset: '-07:20:00',
    endOffset: '-07:10:00',
    title: 'ICPS LH2 tank topping',
    description: 'ICPS liquid hydrogen tank transitions to topping mode.',
    tag: 'tanking'
  },
  {
    offset: '-07:05:00',
    endOffset: '00:00:00',
    title: 'ICPS LH2 replenish',
    description: 'ICPS liquid hydrogen enters continuous replenish mode through terminal count.',
    tag: 'tanking'
  },
  {
    offset: '-06:40:00',
    endOffset: '-06:10:00',
    title: 'Orion communications activated',
    description: 'Orion radio frequency communications to mission control are activated.'
  },
  {
    offset: '-06:39:00',
    endOffset: '-06:05:00',
    title: 'Core stage LOX topping',
    description: 'Core stage liquid oxygen transitions to topping mode.',
    tag: 'tanking'
  },
  {
    offset: '-06:38:00',
    endOffset: '-06:30:00',
    title: 'ICPS LOX MPS chilldown',
    description: 'ICPS liquid oxygen main propulsion system chilldown begins.',
    tag: 'tanking'
  },
  {
    offset: '-06:30:00',
    endOffset: '-05:45:00',
    title: 'ICPS LOX fast fill',
    description: 'ICPS liquid oxygen fast fill begins.',
    tag: 'tanking'
  },
  {
    offset: '-06:10:00',
    title: 'Stage pad rescue / closeout crew assemble',
    description: 'Stage pad rescue is prepared and the closeout crew assembles for crew ingress operations.'
  },
  {
    offset: '-06:05:00',
    endOffset: '00:00:00',
    title: 'Core stage LOX replenish',
    description: 'Core stage liquid oxygen enters continuous replenish mode through terminal count.',
    tag: 'tanking'
  },
  // L-6 hours and counting
  {
    offset: '-06:00:00',
    title: 'Flight crew weather brief',
    description: 'The flight crew receives a final weather briefing for launch and abort landing sites.'
  },
  {
    offset: '-05:45:00',
    endOffset: '-05:30:00',
    title: 'ICPS LOX vent and relief test',
    description: 'ICPS liquid oxygen vent and relief valves are tested.',
    tag: 'tanking'
  },
  {
    offset: '-05:30:00',
    endOffset: '-05:10:00',
    title: 'ICPS LOX topping',
    description: 'ICPS liquid oxygen transitions to topping mode.',
    tag: 'tanking'
  },
  {
    offset: '-05:10:00',
    endOffset: '-04:00:00',
    title: 'All stages replenish / built-in hold (1h 10m)',
    description: 'All stages enter replenish mode. A 1-hour 10-minute built-in hold begins. Closeout crew proceeds to the white room.',
    tag: 'tanking'
  },
  {
    offset: '-04:40:00',
    endOffset: '-04:10:00',
    title: 'Flight crew deploys to pad',
    description: 'The Artemis II crew departs crew quarters and travels to Launch Complex 39B.'
  },
  {
    offset: '-04:00:00',
    title: 'Flight crew boards Orion',
    description: 'The four crew members enter the Orion spacecraft and take their seats.'
  },
  {
    offset: '-03:40:00',
    endOffset: '-03:10:00',
    title: 'Crew module hatch preps and closure',
    description: 'The Orion crew module hatch is prepared and closed by the closeout crew.'
  },
  {
    offset: '-03:10:00',
    endOffset: '-02:45:00',
    title: 'Hatch seal and pressure decay checks',
    description: 'Counterbalance mechanism hatch seal and pressure decay checks verify cabin integrity.'
  },
  {
    offset: '-02:20:00',
    endOffset: '-01:40:00',
    title: 'Hatch service panel install and closeouts',
    description: 'Crew module hatch service panel is installed and final closeout work is completed.'
  },
  {
    offset: '-01:40:00',
    endOffset: '-01:30:00',
    title: 'LAS hatch closure for flight',
    description: 'The launch abort system hatch is closed and secured for flight.'
  },
  {
    offset: '-01:10:00',
    title: 'Launch director brief and TPS scan',
    description: 'The launch director reviews rocket and thermal protection system scan results with the imagery console.'
  },
  {
    offset: '-00:50:00',
    endOffset: '-00:40:00',
    title: 'Closeout crew departs LC 39B',
    description: 'The closeout crew departs Launch Complex 39B. The final NASA test director briefing is held.'
  },
  // L-40 minutes and holding
  {
    offset: '-00:40:00',
    endOffset: '-00:10:00',
    title: 'Built-in hold (30 minutes)',
    description: 'A planned 30-minute hold begins at T-0:10:00 for final readiness assessments before terminal count.'
  },
  // L-25 minutes and holding
  {
    offset: '-00:25:00',
    title: 'Transition to Orion-to-Earth comm loop',
    description: 'The team transitions to the Orion-to-Earth communication loop following the final NTD briefing.'
  },
  {
    offset: '-00:17:00',
    title: 'Launch director polls team for go',
    description: 'The launch director polls the entire team to confirm they are go for launch.'
  },
  {
    offset: '-00:15:00',
    title: 'Flight crew visors down',
    description: 'The Artemis II crew lowers and locks their helmet visors for launch.'
  },
  {
    offset: '-00:14:00',
    title: 'Flight crew short purge verification',
    description: 'A short purge of the crew suit ventilation system is verified.'
  },
  // T-10 minutes and counting
  {
    offset: '-00:10:00',
    title: 'GLS initiates terminal count',
    description: 'The ground launch sequencer initiates the final automated terminal countdown.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:08:00',
    title: 'Crew Access Arm retract',
    description: 'The Crew Access Arm is retracted away from the Orion spacecraft.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:06:00',
    title: 'Core stage tank pressurization / Orion to internal power',
    description: 'GLS commands core stage tank pressurization. Orion ascent pyros are armed and the spacecraft switches to internal power.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:05:57',
    title: 'Core stage LH2 terminate replenish',
    description: 'Core stage liquid hydrogen replenish flow is terminated ahead of flight.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:05:20',
    title: 'LAS capability available',
    description: 'Launch abort system capability becomes available. The NTD notifies the commander.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:04:40',
    title: 'GLS go for LH2 bleed check',
    description: 'The ground launch sequencer commands the liquid hydrogen high flow bleed check.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:04:30',
    title: 'Flight termination system armed',
    description: 'The flight termination system is armed for range safety.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:04:00',
    title: 'Core stage APU start / LOX terminate replenish',
    description: 'GLS commands core stage auxiliary power unit start. Core stage LOX replenish flow is terminated.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:03:30',
    title: 'ICPS LOX terminate replenish',
    description: 'ICPS liquid oxygen replenish flow is terminated.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:03:10',
    title: 'GLS go for purge sequence 4',
    description: 'The ground launch sequencer commands purge sequence 4 for engine compartment inerting.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:02:02',
    title: 'ICPS switches to internal battery power',
    description: 'The interim cryogenic propulsion stage transitions to internal battery power for flight.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:02:00',
    title: 'Boosters switch to internal power',
    description: 'The solid rocket boosters switch from ground power to internal battery power.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:01:30',
    title: 'Core stage switches to internal power',
    description: 'The SLS core stage transitions from ground support to internal power for flight.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:01:20',
    title: 'ICPS enters terminal countdown mode',
    description: 'The interim cryogenic propulsion stage enters its final terminal countdown mode.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:00:50',
    title: 'ICPS LH2 terminate replenish',
    description: 'ICPS liquid hydrogen replenish flow is terminated.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:00:33',
    title: 'Go for automated launch sequencer',
    description: 'GLS sends the go command for the automated launch sequencer to take control.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:00:30',
    title: 'Core stage flight computer to auto sequence',
    description: 'The core stage flight computer transitions to the automated launching sequencer.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:00:12',
    title: 'Hydrogen burn-off igniters initiated',
    description: 'Hydrogen burn-off igniters fire beneath the RS-25 engines to clear residual hydrogen.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:00:10',
    title: 'GLS commands engine start',
    description: 'The ground launch sequencer sends the command for core stage engine ignition.',
    tag: 'terminal-count'
  },
  {
    offset: '-00:00:06',
    title: 'RS-25 engines startup',
    description: 'The four RS-25 engines ignite in a staggered sequence and ramp to full thrust.',
    tag: 'terminal-count'
  },
  {
    offset: '00:00:00',
    title: 'Booster ignition and liftoff',
    description: 'Solid rocket boosters ignite, umbilicals separate, and Artemis II lifts off from Launch Complex 39B.',
    tag: 'terminal-count'
  }
]

const POST_LAUNCH_RAW: RawMissionEvent[] = [
  {
    offset: '+00:00:09',
    title: 'Tower clear and roll program',
    description: 'SLS clears the tower and begins the programmed roll and pitch maneuver.'
  },
  {
    offset: '+00:00:56',
    title: 'Supersonic flight',
    description: 'The launch vehicle passes Mach 1 during ascent.'
  },
  {
    offset: '+00:01:10',
    title: 'Maximum dynamic pressure',
    description: 'Artemis II reaches max-Q, the peak aerodynamic stress point.'
  },
  {
    offset: '+00:02:08',
    title: 'Solid rocket booster separation',
    description: 'Both boosters separate after completing their ascent burn.'
  },
  {
    offset: '+00:03:18',
    title: 'Launch abort system jettison',
    description: 'The launch abort system is discarded once it is no longer required.'
  },
  {
    offset: '+00:08:06',
    title: 'Core stage main engine cutoff',
    description: 'The SLS core stage shuts down its RS-25 engines.'
  },
  {
    offset: '+00:08:18',
    title: 'Core stage separation',
    description: 'The core stage separates from the ICPS in an initial parking orbit.'
  },
  {
    offset: '+00:08:28',
    title: 'ICPS RL10 nozzle extension',
    description: 'The ICPS extends the RL10 nozzle in preparation for later burns.'
  },
  {
    offset: '+00:20:00',
    title: 'Orion solar arrays deploy',
    description: 'Orion deploys its solar array wings for long-duration power generation.'
  },
  {
    offset: '+00:49:00',
    title: 'Perigee raise maneuver',
    description: 'The ICPS performs a burn to raise the parking orbit perigee.'
  },
  {
    offset: '+01:47:57',
    title: 'Apogee raise burn',
    description: 'A precise burn raises the apogee for the next phase of the mission profile.'
  },
  {
    offset: '+03:24:15',
    title: 'Orion separates from ICPS',
    description: 'Orion departs the ICPS and begins a proximity operations demonstration.'
  },
  {
    offset: '+04:35',
    title: 'Proximity operations conclude',
    description: 'The Orion crew completes the planned proximity operations demonstration.'
  },
  {
    offset: '+04:52',
    title: 'Upper stage separation burn',
    description: 'Orion conducts a separation burn to widen distance from the upper stage.'
  },
  {
    offset: '+05:00',
    title: 'ICPS disposal burn',
    description: 'The ICPS disposal sequence begins following Orion departure.'
  },
  {
    offset: '+05:02',
    title: 'ICPS splashdown targeting',
    description: 'The disposal burn refines the ICPS path toward atmospheric reentry and ocean impact.'
  },
  {
    offset: '+05:04',
    title: 'CubeSat deployment sequence',
    description: 'CubeSats deploy at one-minute intervals after upper stage disposal maneuvers.'
  },
  {
    offset: '+0/13:44',
    title: 'Perigee raise burn',
    description: 'Orion performs a perigee raise maneuver after completing early orbit operations.'
  },
  {
    offset: '+1/01:37',
    title: 'Translunar injection burn',
    endOffset: '+1/01:43',
    description: 'A major burn sends Artemis II from Earth orbit onto its lunar trajectory.'
  },
  {
    offset: '+1/23:25',
    title: 'Orbital trajectory correction burn',
    description: 'Navigation teams refine the outbound translunar path.'
  },
  {
    offset: '+2/00:07',
    title: 'Trajectory correction burn #1',
    description: 'The first listed deep-space correction burn fine-tunes Orion\'s trajectory.'
  },
  {
    offset: '+2/02:05',
    title: 'Crew CPR demonstration',
    description: 'The crew conducts an in-flight CPR operations demonstration.'
  },
  {
    offset: '+2/05:25',
    title: 'Deep Space Network communications test',
    description: 'Controllers verify communications performance through the DSN.'
  },
  {
    offset: '+3/00:12',
    title: 'Trajectory correction burn #2',
    description: 'A second trajectory trim maintains the targeted lunar flyby corridor.'
  },
  {
    offset: '+3/03:40',
    title: 'Lunar flyby imaging plan review (Shift 1)',
    description: 'The first shift reviews imagery and camera procedures for the lunar flyby.'
  },
  {
    offset: '+3/05:45',
    title: 'Lunar flyby imaging plan review (Shift 2)',
    description: 'The second shift finalizes lunar flyby observation procedures.'
  },
  {
    offset: '+3/20:30',
    title: 'Rapid spacesuit donning demonstration',
    description: 'The crew practices rapid suit donning and pressurization procedures.'
  },
  {
    offset: '+4/05:23',
    title: 'Trajectory correction burn #3',
    description: 'The third correction burn tunes the final approach to the Moon.'
  },
  {
    offset: '+4/06:59',
    title: 'Enter lunar sphere of influence',
    description: 'Orion crosses into the region where lunar gravity dominates the trajectory.'
  },
  {
    offset: '+04/22:00',
    title: 'Lunar flyby observation begins',
    description: 'The crew begins planned lunar observation and flyby activities.'
  },
  {
    offset: '+5/01:23',
    title: 'Closest approach to the Moon',
    description: 'Artemis II reaches its nearest point to the lunar surface.'
  },
  {
    offset: '+5/01:26',
    title: 'Maximum distance from Earth',
    description: 'The mission reaches its farthest point from Earth during the lunar flyby.'
  },
  {
    offset: '+5/19:47',
    title: 'Exit lunar sphere of influence',
    description: 'Orion departs the Moon\'s primary gravitational influence on the return leg.'
  },
  {
    offset: '+5/21:10',
    title: 'Lunar flyby science debrief',
    description: 'The crew and controllers review observations from the lunar flyby.'
  },
  {
    offset: '+6/04:23',
    title: 'Return trajectory correction burn #1',
    description: 'The first return-leg correction burn refines the Earth reentry corridor.'
  },
  {
    offset: '+7/01:50',
    title: 'Radiation shielding demonstration',
    description: 'The crew performs a shielding procedure demonstration in deep space.'
  },
  {
    offset: '+07/04:20',
    title: 'Manual piloting demonstration',
    description: 'The crew demonstrates manual piloting and handling procedures.'
  },
  {
    offset: '+7/23:15',
    title: 'Orthostatic garment assessment (Shift 1)',
    description: 'The first shift evaluates garments intended to reduce post-landing intolerance.'
  },
  {
    offset: '+8/02:10',
    title: 'Orthostatic garment assessment (Shift 2)',
    description: 'The second shift continues post-landing garment assessment operations.'
  },
  {
    offset: '+8/04:33',
    title: 'Return trajectory correction burn #2',
    description: 'A second return-leg correction burn sharpens the reentry path.'
  },
  {
    offset: '+8/20:33',
    title: 'Return trajectory correction burn #3',
    description: 'The final listed return correction burn completes late-mission targeting.'
  },
  {
    offset: '+8/22:30',
    title: 'Entry checklist begins',
    description: 'The crew works the atmospheric entry checklist and dons entry suits.'
  },
  {
    offset: '+9/01:13',
    title: 'Crew and service module separation',
    description: 'The Orion crew module separates from the service module before reentry.'
  },
  {
    offset: '+9/01:16',
    title: 'Crew module raise burn',
    description: 'The crew module executes a final raise burn before atmospheric interface.'
  },
  {
    offset: '+9/01:33',
    title: 'Entry interface',
    description: 'Orion reaches atmospheric entry interface about 400,000 feet above Earth.'
  },
  {
    offset: '+9/01:46',
    title: 'Splashdown',
    description: 'The Artemis II crew module splashes down to conclude the mission.'
  },
  {
    offset: '+9/01:53',
    title: 'Reaction control system safing',
    description: 'Post-landing safing procedures begin for the crew module thrusters.'
  },
  {
    offset: '+9/02:01',
    title: 'Final power down',
    description: 'The Orion spacecraft completes final power-down after splashdown.'
  }
]

export const PRE_LAUNCH_EVENTS = PRE_LAUNCH_RAW.map(event => toMissionEvent('prelaunch', event))
export const POST_LAUNCH_EVENTS = POST_LAUNCH_RAW.map(event => toMissionEvent('postlaunch', event))
