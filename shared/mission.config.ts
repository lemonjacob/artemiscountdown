export const LAUNCH_DATE = '2026-04-01T22:24:00Z'

export const NASA_STREAMS = [
  '21X5lGlDOfg',
  'P11y8N22Rq0',
  'nA9UZF-SZoQ'
] as const

export type MissionPhase = 'prelaunch' | 'postlaunch'

export interface MissionEvent {
  id: string
  phase: MissionPhase
  title: string
  description: string
  offsetLabel: string
  offsetSeconds: number
}

interface RawMissionEvent {
  offset: string
  title: string
  description: string
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
  offsetSeconds: parseOffsetSeconds(event.offset)
})

const PRE_LAUNCH_RAW: RawMissionEvent[] = [
  {
    offset: '-46:00:00',
    title: 'Launch countdown begins',
    description: 'Artemis II officially enters the terminal launch campaign.'
  },
  {
    offset: '-15:00:00',
    title: 'Pad clears of non-essential personnel',
    description: 'All non-essential workers depart Launch Pad 39B as hazardous operations continue.'
  },
  {
    offset: '-09:40:00',
    title: 'Built-in hold begins',
    description: 'Teams enter the planned hold before fueling transitions and final checks.'
  },
  {
    offset: '-08:00:00',
    title: 'Core stage tanking begins',
    description: 'Liquid oxygen and liquid hydrogen loading starts on the SLS core stage.'
  },
  {
    offset: '-03:30:00',
    title: 'Crew departs O&C Building',
    description: 'The Artemis II crew leaves the Neil Armstrong Operations and Checkout Building.'
  },
  {
    offset: '-03:00:00',
    title: 'Crew ingress begins',
    description: 'Astronauts arrive at Pad 39B and start boarding Orion.'
  },
  {
    offset: '-02:00:00',
    title: 'Hatch closure and leak checks',
    description: 'The Orion hatch is sealed and teams verify cabin integrity.'
  },
  {
    offset: '-00:50:00',
    title: 'Flight director poll for terminal count',
    description: 'Mission management performs the final readiness poll before the terminal count.'
  },
  {
    offset: '-00:10:00',
    title: 'Terminal countdown begins',
    description: 'The final ten minutes start with the count progressing toward liftoff.'
  },
  {
    offset: '-00:05:00',
    title: 'Orion transitions to internal power',
    description: 'The spacecraft switches from ground support to onboard electrical power.'
  },
  {
    offset: '-00:01:00',
    title: 'SLS flight computers take control',
    description: 'Launch vehicle computers assume control for the final automated sequence.'
  },
  {
    offset: '-00:00:06',
    title: 'RS-25 engine startup',
    description: 'The four core stage RS-25 engines ignite moments before booster light.'
  },
  {
    offset: '00:00:00',
    title: 'Liftoff',
    description: 'Artemis II lifts off from Launch Complex 39B.'
  }
]

const POST_LAUNCH_RAW: RawMissionEvent[] = [
  {
    offset: '+00:09',
    title: 'Tower clear and roll program',
    description: 'SLS clears the tower and begins the programmed roll and pitch maneuver.'
  },
  {
    offset: '+00:56',
    title: 'Supersonic flight',
    description: 'The launch vehicle passes Mach 1 during ascent.'
  },
  {
    offset: '+01:10',
    title: 'Maximum dynamic pressure',
    description: 'Artemis II reaches max-Q, the peak aerodynamic stress point.'
  },
  {
    offset: '+02:08',
    title: 'Solid rocket booster separation',
    description: 'Both boosters separate after completing their ascent burn.'
  },
  {
    offset: '+03:18',
    title: 'Launch abort system jettison',
    description: 'The launch abort system is discarded once it is no longer required.'
  },
  {
    offset: '+08:06',
    title: 'Core stage main engine cutoff',
    description: 'The SLS core stage shuts down its RS-25 engines.'
  },
  {
    offset: '+08:18',
    title: 'Core stage separation',
    description: 'The core stage separates from the ICPS in an initial parking orbit.'
  },
  {
    offset: '+08:28',
    title: 'ICPS RL10 nozzle extension',
    description: 'The ICPS extends the RL10 nozzle in preparation for later burns.'
  },
  {
    offset: '+20:00',
    title: 'Orion solar arrays deploy',
    description: 'Orion deploys its solar array wings for long-duration power generation.'
  },
  {
    offset: '+49:00',
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
