"use client";

import { useState } from "react";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import type { ArchivedCleanupSchedule, CleanupScheduleRequest } from "@/lib/types";
import {
  archiveCleanupSchedule,
  downloadCleanupBackup,
  hideSeedPickup,
  restoreCleanupSchedule,
} from "@/lib/user";

interface CleanupScheduleListProps {
  items: CleanupScheduleRequest[];
  onChange: () => void;
  compact?: boolean;
  showArchiveActions?: boolean;
  seedIds?: Set<string>;
}

export default function CleanupScheduleList({
  items,
  onChange,
  compact = false,
  showArchiveActions = true,
  seedIds,
}: CleanupScheduleListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">
        No upcoming cleanups.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((job) => (
        <li
          key={job.id}
          className={`rounded-lg bg-white ring-1 ring-teal-100 ${
            compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <span className="font-medium text-teal-950">{job.suburb}</span>
                <span className="shrink-0 text-xs capitalize text-teal-600">
                  {job.status}
                </span>
              </div>
              <p className="text-teal-800">
                {job.date}
                {job.timeSlot
                  ? ` · ${job.timeSlot === "afternoon" ? "Afternoon" : "Morning"}`
                  : ""}
              </p>
              {!compact && job.bins?.length ? (
                <p className="text-xs text-teal-700">Bins: {job.bins.join(", ")}</p>
              ) : null}
              {!compact && job.notes ? (
                <p className="text-xs text-teal-600">{job.notes}</p>
              ) : null}
              {!compact && <p className="text-xs text-teal-500">{job.id}</p>}
            </div>
            {showArchiveActions && (
              <ArchiveButton
                job={job}
                isSeed={seedIds?.has(job.id)}
                onChange={onChange}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ArchiveButton({
  job,
  isSeed,
  onChange,
}: {
  job: CleanupScheduleRequest;
  isSeed?: boolean;
  onChange: () => void;
}) {
  function handleArchive() {
    if (isSeed) {
      hideSeedPickup(job.id);
    } else {
      archiveCleanupSchedule(job.id, "removed");
    }
    onChange();
  }

  return (
    <button
      type="button"
      onClick={handleArchive}
      title="Archive and remove from list"
      className="shrink-0 rounded-lg p-1.5 text-teal-600 hover:bg-teal-50 hover:text-teal-800"
    >
      <Archive className="h-4 w-4" />
    </button>
  );
}

interface ArchivedCleanupSectionProps {
  archived: ArchivedCleanupSchedule[];
  onChange: () => void;
}

export function ArchivedCleanupSection({
  archived,
  onChange,
}: ArchivedCleanupSectionProps) {
  const [open, setOpen] = useState(false);

  if (archived.length === 0) return null;

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-gray-100"
      >
        <span className="flex items-center gap-2">
          <Archive className="h-4 w-4" />
          Archived ({archived.length})
        </span>
        <span className="text-xs text-teal-600">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={downloadCleanupBackup}
              className="text-xs font-medium text-teal-600 underline"
            >
              Download backup JSON
            </button>
          </div>
          <ul className="space-y-2">
            {archived.map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 text-sm text-teal-800"
              >
                <div>
                  <p className="font-medium">{job.suburb} · {job.date}</p>
                  <p className="text-xs text-teal-600">
                    Archived {job.archivedAt.slice(0, 10)} · {job.archiveReason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    restoreCleanupSchedule(job.id);
                    onChange();
                  }}
                  title="Restore to upcoming"
                  className="rounded-lg p-1.5 text-teal-600 hover:bg-white"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function CleanupBackupButton() {
  return (
    <button
      type="button"
      onClick={downloadCleanupBackup}
      className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 underline"
    >
      <Trash2 className="h-3 w-3" />
      Export schedule backup
    </button>
  );
}
