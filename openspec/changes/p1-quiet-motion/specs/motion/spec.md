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
