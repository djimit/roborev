## ADDED Requirements

### Requirement: Fleet heartbeat failures do not terminate the server

Djimitflo SHALL treat a failed periodic fleet heartbeat update as best-effort
housekeeping instead of an unrecoverable server error.

#### Scenario: The fleet heartbeat database update fails
- **WHEN** a periodic fleet heartbeat update raises a database error
- **THEN** Djimitflo SHALL log the failed heartbeat tick
- **AND** the error SHALL NOT escape the timer callback or terminate the server
- **AND** Djimitflo SHALL leave retry behavior to the next configured heartbeat
  interval
