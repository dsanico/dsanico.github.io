---
layout: post
title: Upgrading an Electric Nerf Blaster
subtitle: A High-School DIY Journey through Electronics
cover-img: /assets/img/projects/nerfblaster-cover.jpg
thumbnail-img: /assets/img/projects/nerfblaster-internals.jpg
# share-img: 
gh-repo: dsanico/dsanico.github.io
tags: [Electrical Engineering, Personal Project]
---
# Table of Contents
[Project Overview](#project-overview)
- [Background](#background)
- [Plan](#plan)

[Materials and Methods](#materials-and-methods)
- [Initial Planning](#initial-planning)
- [Internal Retrofitting](#internal-retrofitting)
- [External Retrofitting](#external-retrofitting)
- [Final Reassembly](#final-reassembly)
  


# Project Overview 

### Background
The niche hobby of [Nerf modding](https://www.themanual.com/culture/how-to-mod-a-nerf-gun-hammershot-modification-luke-goodman/) involves taking Nerf blasters apart and tinkering with their internal or external parts to achieve enhanced performance or aesthetics. Performance upgrades include shooting harder, at a higher rate of fire, or shooting an entirely different type of ammo. Aesthetic upgrades include painting new color designs, installing third-party external parts, or even cutting apart and integrating two or more different blasters. 

I got into this hobby at a very young age, but the mods I did remained at the simple level of taking apart, spray-painting, and reassembling the blasters. However, in high school, I decided to revisit the hobby and dive into the world of electronics, culminating in this **three-year project**.


### Plan
The goal for this project was to enhance both the peformance and aesthetics of a stock, electric, semi-automatic Nerf blaster.

**Performance upgrades included:** 


| _Parameter_ | _Stock_ | _Upgrade_ | 
| :---| :--- | :--- | 
| **Firing mechanic:** | semi-automatic | fully-automatic |
| **Ammo compatibility:** | full-length darts | half-length darts + embedded tracer ammo charging |
| **Battery:** | four AA's | 7.4V 750mA LiPo |
| **Battery life indicator:** | none | internal digital voltmeter |
| **Flywheel system:** | stock | high-performance motors, flywheels, and flywheel cage |

**Aesthetic upgrades included:**


| _Parameter_ | _Stock_ | _Upgrade_ | 
| :---| :--- | :--- | 
| **Kit:** | none | third-party Scorpion-Evo replica kit |
| **Lights:** | none | white LEDs |
| **Visibe Internals:** | none | flywheel system |
| **Paint:** | stock | black ice color theme |


# Materials and Methods
_The project had four stages: initial planning, internal retrofitting, external retrofitting, and final reassembly._

### Initial Planning
In this stage, I determined how I would implement all of my desired upgrades. I first had to choose materials that were compatible and would help achieve the goals of improved performance and aesthetics. Detailed materials lists are shown in the internal and external retrofitting sections. I then determined a high-level plan for completing the project, which consists of the following three stages detailed below.

### Internal Retrofitting
This stage involved removing all of the unnecessary internals from the blaster and installing the new internals. This stage was done first because plastic cutting was necessary, which could damage any paint coating previously applied. I first snipped some plastic supports inside the blaster to make space for larger switches and the new gearbox and drilled holes in the battery compartment to feed new wires through via an XT60 connector to the LiPo battery. I then installed the full-auto conversion kit, which utilized a motor and gearbox to automatically push the "pusher" (_intuitively named, the rod that pushes the dart into the flywheels_) instead of relying on a trigger pull to mechanically push the pusher. I also soldered lower-awg wires and switches, installed a high-performance flywheel cage, flywheels, and motors ([Fang ReVAMPeds](https://outofdarts.com/products/fang-revamped-130-2s-neo-motor-for-nerf-blasters?_pos=1&_sid=d8854fb34&_ss=r) for the flywheel system and a [Meishel 2.0](https://outofdarts.com/products/meishel-2-0-130-2s-motor-for-nerf-blasters?_pos=1&_sid=a0bccc9a0&_ss=r) for the pusher system), installed a hybrid pusher compatible with both full-length and half-length darts, and soldered a separate circuit with a toggle switch, LEDs, and a mini digital voltmeter.

**Materials List:**

- Fully-automatic firing mechanism conversion kit
- 7.4V 750mA Lithium Polymer battery
- 18 awg wires
- Male XT60 connector
- 3x 15A momentary microswitches
- Soldering lead
- Inferno flywheels
- Aurora flywheel cage
- 2x Fang ReVAMPed motors
- Meishel 2.0 motor
- Mini digital voltmeter
- White and UV LEDs
- Hybrid pusher

Here's a look at the complete internals (note that this picture was taken during final reassembly, so the paint colors are different). The flywheels are the black discs with fireballs printed on them, the flywheel cage is the clear plastic part housing them, and the pusher system is in the top right corner of the blaster. 
![Internals](https://dsanico.github.io/assets/img/projects/nerfblaster-internals.jpg)
_Apologies for the janky workspace - I did everything at home._

### External Retrofitting
This stage involved installing external, primarily aesthetic upgrades. I started with the flywheel windows kit, which made the flywheel system visible from the outside via two polycarbonate windows. I carefully removed all the internals, then made rectangular cut-outs in the shell to expose the flywheel system. I then secured the 3D-printed window risers with epoxy and sanded the epoxy smooth. I then spray painted the blaster shell and the Scorpion-Evo kit's parts. I also included a half-dart magazine adaptor that goes in the magazine well to accept angled half-dart magazines.


**Materials List:**
- Flywheel windows kit
- Extended battery cover
- Scorpion-Evo conversion kit
- Spray-paint
- Masking tape
- Half-dart magazine adapter

This is the painted base of the blaster. The flywheels and flywheel cage are visible from the outside thanks to the flywheel windows kit.
![Closed Base](https://dsanico.github.io/assets/img/projects/nerfblaster-base.jpg)

### Final Reassembly
The final reassembly simply involved reinstalling the internals then reinstalling the Scorpion-Evo kit after closing the blaster. This is the final result:
![Completed Full](https://dsanico.github.io/assets/img/projects/nerfblaster-completed-full.jpg)
![Closed Close](https://dsanico.github.io/assets/img/projects/nerfblaster-completed-close.jpg)
