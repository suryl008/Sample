import { Injectable, OnDestroy } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SessionTimeoutService implements OnDestroy {
  static readonly STORAGE_KEY = "lastActivityAt";
  static readonly IDLE_LIMIT_MS = 60 * 60 * 1000;
  static readonly SHOW_AFTER_IDLE_MS = 60 * 1000;
  static readonly ACTIVITY_THROTTLE_MS = 1000;

  private readonly legacyStorageKeys = ["lastClickDateTime", "lastlickDateTime"];
  private readonly activityEvents: Array<keyof DocumentEventMap> = [
    "click",
    "keydown",
    "touchstart",
  ];

  private watching = false;
  private lastWriteMs = 0;
  private readonly onActivity = (): void => this.recordActivity();

  get idleLimitMs(): number {
    return SessionTimeoutService.IDLE_LIMIT_MS;
  }

  get showAfterIdleMs(): number {
    return SessionTimeoutService.SHOW_AFTER_IDLE_MS;
  }

  ngOnDestroy(): void {
    this.stopWatching();
  }

  startWatching(): void {
    if (this.watching || typeof document === "undefined") {
      return;
    }

    this.watching = true;
    this.seedActivity();

    try {
      this.activityEvents.forEach((eventName) => {
        document.addEventListener(eventName, this.onActivity, true);
      });
    } catch (error) {
      console.error("Unable to start session activity listeners.", error);
      this.watching = false;
    }
  }

  stopWatching(): void {
    if (!this.watching || typeof document === "undefined") {
      this.watching = false;
      return;
    }

    try {
      this.activityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, this.onActivity, true);
      });
    } catch (error) {
      console.error("Unable to stop session activity listeners.", error);
    } finally {
      this.watching = false;
    }
  }

  recordActivity(force = false): void {
    if (!this.watching && !force) {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastWriteMs < SessionTimeoutService.ACTIVITY_THROTTLE_MS) {
      return;
    }

    this.lastWriteMs = now;
    this.writeActivity(now);
  }

  extendSession(): void {
    this.recordActivity(true);
  }

  getRemainingMs(): number {
    const lastActivityMs = this.readLastActivity();
    if (lastActivityMs === null) {
      return this.idleLimitMs;
    }

    return this.idleLimitMs - (Date.now() - lastActivityMs);
  }

  shouldDisplayTimer(remainingMs: number): boolean {
    return remainingMs > 0 && remainingMs <= this.idleLimitMs - this.showAfterIdleMs;
  }

  formatRemaining(remainingMs: number): string {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private seedActivity(): void {
    if (this.readLastActivity() !== null) {
      this.clearLegacyKeys();
      return;
    }

    const migrated = this.migrateLegacyActivity();
    if (!migrated) {
      this.recordActivity(true);
    }
    this.clearLegacyKeys();
  }

  private migrateLegacyActivity(): boolean {
    try {
      let newestMs: number | null = null;

      for (const key of this.legacyStorageKeys) {
        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        const parsed = Date.parse(raw);
        if (!Number.isNaN(parsed) && parsed > 0) {
          if (newestMs === null || parsed > newestMs) {
            newestMs = parsed;
          }
        }
      }

      if (newestMs !== null) {
        this.lastWriteMs = newestMs;
        this.writeActivity(newestMs);
        return true;
      }
    } catch (error) {
      console.error("Unable to migrate legacy session activity timestamp.", error);
    }

    return false;
  }

  private readLastActivity(): number | null {
    try {
      const raw = localStorage.getItem(SessionTimeoutService.STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = Number(raw);
      if (Number.isNaN(parsed) || parsed <= 0) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Unable to read session activity timestamp.", error);
      return null;
    }
  }

  private writeActivity(timestampMs: number): void {
    try {
      localStorage.setItem(
        SessionTimeoutService.STORAGE_KEY,
        String(timestampMs),
      );
    } catch (error) {
      console.error("Unable to persist session activity timestamp.", error);
    }
  }

  private clearLegacyKeys(): void {
    try {
      this.legacyStorageKeys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Unable to clear legacy session activity keys.", error);
    }
  }

  private pad(value: number): string {
    return value.toString().padStart(2, "0");
  }
}
