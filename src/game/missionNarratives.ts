import { VoiceBriefing } from '../types';

export const MISSION_BRIEFINGS: Record<string, VoiceBriefing> = {
  welcome: {
    id: 'intro_welcome',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'WELCOME TO METROPOLIS, UNDERBOSS',
    audioText:
      'Underboss, listen closely. Don Falcone sent you to reclaim this city. The rival Moretti mob and Bratva cartels have taken over our districts. Check your tactical radar in the corner to track hostile territory. Press O and P to enable automatic aiming and trigger, or take manual control. Upgrade your weapons at the Foundry with key K. Move out and take back what is rightfully ours.',
    writtenText:
      'Don Falcone sent you to reclaim Metropolis. Rival cartels control the districts. Use the corner radar to track enemy movements. Toggle [O] for Auto-Aim and [P] for Auto-Shoot, or aim with your mouse/touch. Press [K] to open the Evolution Foundry and upgrade weapon tiers.',
  },

  q1: {
    id: 'quest_1_briefing',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'OPERATION I: LITTLE ITALY BORDER CLASHES',
    audioText:
      'Underboss, Moretti enforcers are encroaching on the Greenvale boundary. Eliminate four syndicate patrol thugs and claim the supply caches. Watch their firing lines and use your dash with spacebar to dodge incoming rounds. Once the border is secure, report back to Vincenzo.',
    writtenText:
      'Moretti enforcers are probing our perimeter. Neutralize 4 syndicate patrol enforcers. Dodge hostile gunfire using [Spacebar] tactical dash. Secure the area to push our family influence into the district.',
  },

  q2: {
    id: 'quest_2_briefing',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'OPERATION II: WATERFRONT SMUGGLER DOCKS',
    audioText:
      'We have intercepted communications from the Waterfront Docks. Bratva cartel heavies are unloading high-caliber arms and cybernetic equipment. Infiltrate the port warehouses, take down their guards, and seize the weapons crate. You will find combat shotguns and plasma ordnance in the shipping containers.',
    writtenText:
      'Bratva heavies are unloading military-grade shipments at Waterfront Port. Infiltrate the docks, eliminate the guards, and loot the heavy weapon crates to strengthen our family armory.',
  },

  q3: {
    id: 'quest_3_briefing',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'OPERATION III: DOWNTOWN FINANCIAL RAID',
    audioText:
      'The Moretti family is laundering millions through the Downtown City Bank. Move into the financial district. Watch out for their sniper outposts and heavy assault vehicles. Neutralize the vault security guards and secure the extortion ledger. This will strip Moretti of his operational funds.',
    writtenText:
      'Moretti mob is laundering syndicate funds downtown. Move into the financial district, eliminate the armored enforcers, and breach the safehouse to cut their cash flow.',
  },

  q4: {
    id: 'quest_4_briefing',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'OPERATION IV: CHINATOWN NEON STRIP',
    audioText:
      'The Yakuza Syndicate controls the Neon Strip and underground gambling dens. They have deployed elite katana duelists and tech snipers. Use high-tier assault weapons or mount an armored battle car to punch through their barricades. Clear the district to unite the underworld under our banner.',
    writtenText:
      'Advance to the Neon Strip. Yakuza enforcers have fortified the casino street. Mount vehicles [E] or discharge advanced plasma weaponry to break their lines and conquer the territory.',
  },

  q5: {
    id: 'quest_5_briefing',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'OPERATION V: CONFRONT DON MORETTI',
    audioText:
      'This is the endgame, Underboss. Don Moretti has barricaded himself in the Grand Penthouse with his personal elite bodyguards. He is heavily shielded and armed with explosive ordinance. Dodge his orbital barrages, break his energy shield, and eliminate him once and for all. Take the crown!',
    writtenText:
      'Eliminate Don Moretti at the Grand Penthouse. Evade his red explosive danger zones, breach his armor with heavy fire, and end the syndicate war once and for all.',
  },

  district_downtown_conquered: {
    id: 'downtown_conquered',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'TERRITORY CONQUERED: DOWNTOWN FINANCIAL',
    audioText:
      'Attention Falcone syndicate! Downtown Financial is now officially under our family control. Moretti flag has been torn down. Falcone foot soldiers are now patrolling the streets. Outstanding work, Underboss!',
    writtenText:
      'Downtown Financial is now 100% conquered by the Falcone Syndicate! Falcone patrol troops now guard the district and hostile influence has been expelled.',
  },

  district_waterfront_conquered: {
    id: 'waterfront_conquered',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'TERRITORY CONQUERED: WATERFRONT PORT',
    audioText:
      'The Waterfront Docks belong to the Falcone Family! The Bratva smugglers have surrendered their cargo. Our supply lines are now secure.',
    writtenText:
      'Waterfront Port conquered! Falcone Syndicate now controls shipping lanes and black market supply crates.',
  },

  district_chinatown_conquered: {
    id: 'chinatown_conquered',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'TERRITORY CONQUERED: NEON STRIP',
    audioText:
      'Neon Strip is secured! The Yakuza have retreated into the shadows. The city skyline glows green under Falcone syndicate authority.',
    writtenText:
      'Neon Strip conquered! Falcone Family controls the casino avenue and technology hubs.',
  },

  district_industrial_conquered: {
    id: 'industrial_conquered',
    speaker: 'Consigliere Tomas Falcone',
    role: 'Syndicate Adviser',
    title: 'TERRITORY CONQUERED: INDUSTRIAL YARD',
    audioText:
      'Industrial Rail Yard is ours! Our vehicle workshops and munitions factories are operating at maximum capacity.',
    writtenText:
      'Industrial Rail Yard conquered! Automated workshops and supply depots are fully secured.',
  },
};

export const MISSION_WALKTHROUGH_STEPS = [
  {
    stepNumber: 1,
    title: 'Tactical Controls & Automatic Systems',
    audioText:
      'Master your combat layout. Use WASD or arrows to move. Press O to toggle Auto-Aim proximity targeting, and P for Auto-Shoot trigger. If you run out of ammunition or engage in close quarters, your combat knife strikes automatically. Press T to toggle on-screen touch joysticks for mobile or dual-analog control.',
    content:
      '• Movement: [W, A, S, D] or Arrow Keys / Left Virtual Joystick\n• Auto-Aim: Press [O] to automatically lock crosshairs onto the nearest hostile\n• Auto-Shoot: Press [P] for continuous automatic fire when in range\n• Melee Defense: In close combat (<70px) or while reloading, your combat blade strikes automatically\n• Tactical Dash: Press [Spacebar] for invulnerable dodge roll with stamina\n• Touch Controls: Press [T] to toggle on-screen dual analog virtual joysticks',
  },
  {
    stepNumber: 2,
    title: 'Open-World Radar Minimap & Territory Conquest',
    audioText:
      'Your radar minimap in the corner tracks hostile movements in real time. Red dots represent rival cartel thugs, green dots are friendly Falcone troops, and gold icons mark syndicate objectives. Conquering districts expands your influence, spawns allied guards, and secures valuable tribute.',
    content:
      '• Minimap: Located in the top corner. Displays player heading, district borders, and active blips.\n• Blip Colors: Red = Hostiles, Green = Falcone Allies, Gold = Supply Crates & Quests, Skull = Bosses.\n• Territory Conquest: Clearing enforcers raises Falcone Influence to 100%, turning the zone Emerald Green.\n• Allied Reinforcements: Conquered sectors spawn armed Falcone troops who fight alongside you.',
  },
  {
    stepNumber: 3,
    title: 'Arsenal Evolution & Weapon Tiers',
    audioText:
      'Collect syndicate cash from defeated mobsters. Open the Weapon Advancement Foundry by pressing K. Upgrade your firearms through five tiers: from Common to God-Tier Ascended, gaining increased bullet velocity, armor penetration, explosive payloads, and lightning arcs.',
    content:
      '• Foundry: Press [K] or click the WEAPONS button to open Weapon Advancement.\n• Upgrade Tiers: Common -> Enhanced -> Mastercrafted -> Prototype -> God-Tier Ascended.\n• Weapon Classes: SMG, Vulcan Pyrocaster, Heavy RPG, Tesla Arc Rifle, Cluster Railgun.\n• Infinite Ammo: Press [U] anytime to toggle unlimited ammo and instant fire.',
  },
  {
    stepNumber: 4,
    title: 'Vehicles, Cybernetics & Infinite Frontiers',
    audioText:
      'Mount armored muscle cars and hovercrafts with key E to cruise the city streets at high speed. As you venture past the core metropolis into endless sectors, face roaming Titan Colossi, unlock deep biome supply drops, and establish your criminal empire across infinite coordinates.',
    content:
      '• Vehicles: Press [E] near cars to mount/dismount. Fire mounted cannons while driving!\n• Colony Outposts: Press [B] to build factories, turrets, and mineral extractors.\n• Cyber Hacking: Press [H] to hack hostile turrets, cameras, and syndicate accounts.\n• Infinite Sectors: Travel past 3000m coordinates to discover procedural biomes and Titans.',
  },
];
