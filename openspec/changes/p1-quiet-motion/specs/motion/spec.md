## ADDED Requirements

### Requirement: Motion SHALL honour three tiers
The app SHALL offer Full, Calm and Off motion, chosen in Settings (default System). Under System, OS reduced motion SHALL select Calm. Calm SHALL limit animation to opacity, colour and progress fills. Off SHALL make state changes instant.

#### Scenario: Reduced motion
- **WHEN** the OS asks for reduced motion and Settings → Motion is System
- **THEN** Pip does not move, feathers and drift do not render, and screens only fade

### Requirement: Animated numbers SHALL end on stored values
Count-ups SHALL finish on the exact stored value, and assistive technology SHALL only receive the final value.

#### Scenario: Interrupted count
- **WHEN** Home unmounts or the value changes mid count-up
- **THEN** the displayed value is the true stored value

### Requirement: The daily celebration SHALL fire at most once a day
The target-met celebration SHALL fire only when today's logged minutes reach the real target, and at most once per calendar day.

#### Scenario: Ritual tap after the target
- **WHEN** the target is already met and the aspirant ticks a ritual
- **THEN** no celebration plays

### Requirement: Nothing SHALL animate while the app is hidden
CSS animations SHALL pause while the document is hidden.

### Requirement: Saves are visible and never wait
A Quick log save SHALL be written before any animation, then shown: Save turns into a check, the sheet closes, and the new session grows into the open list with a short highlight.

#### Scenario: Save during the sheet animation
- **WHEN** the user taps Save while the sheet is still opening
- **THEN** the session is stored at once and the sheet's exit does not delay the write

### Requirement: Home arrival only when it means something
The Home arrival sequence SHALL play on the first Home visit of a local day or after 30 minutes away; otherwise Home shows its finished state.

#### Scenario: Tab switch inside 30 minutes
- **WHEN** the user leaves Home and returns within 30 minutes on the same day
- **THEN** the ring and numbers show their final values without replaying
