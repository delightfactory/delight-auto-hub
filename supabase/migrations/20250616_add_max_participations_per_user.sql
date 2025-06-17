-- Migration: Add per-user participation limit to cave_events
alter table cave_events
  add column max_participations_per_user integer not null default 1;
