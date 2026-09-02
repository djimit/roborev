# Djimit ecosysteem — herstel- en upgrade-tranche 2026-09-01/02

Muterende opvolging op de audits van 2026-08-24 en 2026-08-26. Alle wijzigingen
uitgevoerd met expliciete gebruikerstoestemming (scope: "alles incl. P1 fixes",
later per fase bevestigd). Rollback-punten staan per item vermeld.

## 1. Werkstation — Docker-image-upgrades (01-09)

Compose: `/home/djimit/pentagi/docker-compose-observability.yml`
Backups: `.bak-20260901` + `.bak2`

| Container | Van | Naar | Status |
|---|---|---|---|
| grafana | 11.4.0 | **13.0.8** | ✅ health OK, migrations ok |
| cadvisor | v0.51.0 | **v0.55.1** | ✅ running |
| node_exporter | v1.8.2 | **v1.12.1** | ✅ running |
| jaeger (v1) | 1.56.0 | 1.76.0 → **rollback** | grpc-plugin storage verwijderd in nieuwere v1; zie Jaeger-v2 hieronder |
| jaeger (v2) | — | **2.20.0** | ✅ end-to-end bewezen |

Jaeger v2-architectuur:
- Nieuwe service `clickhouse-jaeger` (ClickHouse **26.3**, db/user/pass `jaeger/jaeger`) — dedicated sidecar, pentagi-clickstore (24.x, productiedata) onaangeroerd.
- `jaeger` = `jaegertracing/jaeger:2.20.0`, config `observability/jaeger-v2/config.yml`,
  vereist `--feature-gates storage.clickhouse` (experimental).
- Volume toegevoegd: `clickhouse-jaeger-data`.
- Oude v1-data (15k spans, 3 dagen) als disposable behandeld en niet gemigreerd.
- Eindbewijs: OTLP-testtrace → CH-spans → `/api/services` → Grafana-datasource
  `uid=jaeger` health **OK** (`Data source is working`).

PentAGI-tracing gerepareerd (02-09): root cause was dat PentAGI zijn eigen
OTLP-receiver-poort (**8148 gRPC**) nodig heeft, niet jaeger direct.
`/mnt/data/pentagi/.env`: `OTEL_HOST=192.168.112.2:8148` (otel-container-IP op
pentagi-network). Bewijs: 40+ spans in CH, service `pentagi` in Jaeger-API.

Otel scrape-hygiëne (02-09):
- `pgexporter` was 4 weken exited → herstart; metrics stromen weer.
- Docker-engine-scrape (`host.docker.internal:9323`) verwijderd uit
  `observability/otel/config.yml` (daemon heeft geen metrics-addr; cAdvisor dekt
  container-metrics af) — receiver-blok én pipeline-ref verwijderd.
- Jaeger v2 prometheus-metrics op **8888** (via telemetry.readers.pull in
  jaeger-v2 config); otel-targets bijgewerkt.
- Eindstand: **0 scrape-failures** in otel-logs.

## 2. Werkstation — OpenClaw/Tekstgram-fleet (02-09)

- **7 automations groen** (was 7x error): root cause = sandbox-image
  `openclaw-sandbox:bookworm-slim` stond alleen in de root-docker-context,
  gateway draait rootless. Fix: `docker save | docker load` naar rootless-context.
- `openclaw-health-summary.sh` hersteld: plugin-consent (brave, tavily via
  `--accept-capabilities`), `policy check --agent main`, doctor-lint op
  `severity-min error`, security-audit met false-positive-whitelist (3 GSD-skill-
  docs + deploy-rollback zijn documentatie-matches, geen echte bevindingen).
- Memory-indexes gereindexeerd (coding 6, main 8 files); content/monitoring hebben
  geen memory-bestanden (leeg is correct).
- getUpdates-conflict op @Djimit_bot **geroot-caused en bewust geaccepteerd**:
  main-poller rebuildt transport elke ~64-70s (normaal long-poll-patroon); tijdens
  rebuild botst de kortstondige isolated-polling-worker met de main-poller
  (Telegram staat 1 gelijktijdige getUpdates per token toe). Geen dataverlies
  (updates 361/362 netjes verwerkt, pending=0). Webhook-mode is de canonical fix
  maar vereist publieke URL — gateway is bewust loopback-only. Warnings zijn
  cosmetisch; bot functioneert (works, transport: just now).

## 3. Telegram-fleet-audit (02-09)

| Bot | Host | Status |
|---|---|---|
| @Djimit_bot (OpenClaw) | workstation | works; automations leveren af naar chat 5181065150 |
| @Djimit2_bot (Hermes) | agenticservices | 0 telegram-errors (IPv6-fallback-warnings onschuldig) |
| Hermes MacMini | macmini | levert af (laatste response bewezen) |
| @Djimit3_bot (Hermes) | Eve-V | active; alleen cosmetische PTBUserWarning |
| @Djimitflowbot (DeerFlow) | workstation | eigen bot-token, apart |
| @DjimitNL_bot | djimit-web | **push-only** (Next.js contact-API); sendMessage bewezen OK; geen poller nodig |

SSH-fix: djimit-web public IP 62.129.138.87:2612 is ufw-gedicht (tailscale0-only);
`~/.ssh/config` `vps-djimit-web` omgezet naar tailnet-IP `100.96.192.29`.

## 4. P1-fixes uit audit 2026-08-24

| P1 | Actie | Bewijs |
|---|---|---|
| Interne trust als auth (Qdrant) | `QDRANT__SERVICE__API_KEY` gezet op workstation-qdrant (compose DjimitKBWiki); key = bestaande litellm qdrant_api_key zodat clients zonder config-wijziging blijven werken | 401 zonder key (extern), 200 met key, 24 collections intact |
| Publicatiebron niet codeautoriteit (Eve-V) | Al eerder hersteld; live geverifieerd | `/.env` → 410 + `cache-control: no-store`; working tree clean |
| Herstelbewijs (NAS-restore) | Live NAS-bron restore-test gedraaid op agenticservices | `restore-attestation.json` 20260901T212217Z: postgres + qdrant, 24 collections, **pass**, RTO ≈ 62 min |
| Herstelbewijs (workstation off-host) | Lokale restic-repo blijft primair; NAS-replica geautomatiseerd via `ExecStartPost=/usr/local/sbin/restic-nas-replicate.sh` (rsync-safe, excludes locks) | 2 handmatige runs bewezen; **77/77 snapshots** op NAS = lokaal |
| /dev/sdb degradatie | Schijf **gecommineerd**: label `DO-NOT-USE`, smartd.conf-annotatie; short selftest = pass (sectors blijven 136/136) | Fysieke vervanging (ST4000LM016 S/N W800F9XD) blijft users-actie |
| NAS-restore-testtimer | Kwartaal → **maandelijks** (1e van elke maand 01:30 UTC) | systemd-timer bevestigd; volgende 1 okt |

## 5. OS-updates

| Host | Van | Naar | Extra |
|---|---|---|---|
| workstation | 11 apt-updates | 0 | 17 containers intact |
| Eve-V | 58 apt-updates | 0 | **kernel 7.0.0-30 + reboot**; fail2ban geïnstalleerd (sshd-jail actief), ufw aan |
| MacBook | 42 brew-packages | 0 | node 26.8.1, ollama 0.33.2, go 1.27.0; launchd-jobs gezond |

## 6. Git-drift geëlimineerd (02-09, user: "commit")

| Repo | Commits | Push |
|---|---|---|
| DjimIT (djimit-memory) | 2 | `350de5b..048fc9e` |
| Rechtspraak (uitspraken) | 4 | `7c5bbd7..9389c52` (rebase-conflict package-lock opgelost; typecheck+build+compileall groen) |
| research_agent (feat/memory-evolution) | 1 | `1808010..69f9178` |
| inference-forge | 1 | `ccab3f9..9ebba53` (rebase op nieuwe origin/main) |

VPS/"roborev"-repo had 0 tracked changes — de 162 "dirty files" zijn untracked
home-dotfiles (git-root staat op home; secrets-cleanup commit 0df06cb2 was al
succesvol: 0 tokens in tracked files).

## 7. Openstaand

1. **restic-nas-replicate eerste geautomatiseerde run** — morgen ~03:11 UTC;
   valideren via `journalctl -t restic-nas-replicate` (handmatige runs al 2x bewezen).
2. **/dev/sdb fysiek vervangen** (users-actie).
3. **GitHub Pro-besluit** voor branch-protection op private repos (403 zonder Pro).
4. **Jaeger-v1 all-in-one image opruimen** na stabilisatieperiode van v2.
5. **@DjimitNL_bot SSH-route** vastgelegd op tailnet-IP (public is bewust dicht).