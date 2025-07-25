export type MonitoringErrorData = {
  message: string;
  source?: string;
} & MonitoringErrorContext;

export type MonitoringErrorContext = {
  timestamp?: Date;
  level?: MonitoringErrorLevel;
  component?: string;
  userId?: string;
  sessionId?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
};

/**
 * Builder class for creating MonitoringErrorContext with fluent interface
 */
export class MonitoringErrorContextBuilder {
  private _context: Partial<MonitoringErrorContext> = {};

  constructor() {
    this._context.timestamp = new Date();
  }

  /**
   * Static factory method to create a new context builder
   */
  static create(): MonitoringErrorContextBuilder {
    return new MonitoringErrorContextBuilder();
  }

  /**
   * Static factory methods for different error levels
   */
  static error(): MonitoringErrorContextBuilder {
    return new MonitoringErrorContextBuilder().level("error");
  }

  static warning(): MonitoringErrorContextBuilder {
    return new MonitoringErrorContextBuilder().level("warning");
  }

  static info(): MonitoringErrorContextBuilder {
    return new MonitoringErrorContextBuilder().level("info");
  }

  static debug(): MonitoringErrorContextBuilder {
    return new MonitoringErrorContextBuilder().level("debug");
  }

  static fatal(): MonitoringErrorContextBuilder {
    return new MonitoringErrorContextBuilder().level("fatal");
  }

  /**
   * Set error level
   */
  level(level: MonitoringErrorLevel): MonitoringErrorContextBuilder {
    this._context.level = level;
    return this;
  }

  /**
   * Set component name
   */
  component(component: string): MonitoringErrorContextBuilder {
    this._context.component = component;
    return this;
  }

  /**
   * Set user ID
   */
  userId(userId: string): MonitoringErrorContextBuilder {
    this._context.userId = userId;
    return this;
  }

  /**
   * Set session ID
   */
  sessionId(sessionId: string): MonitoringErrorContextBuilder {
    this._context.sessionId = sessionId;
    return this;
  }

  /**
   * Set timestamp
   */
  timestamp(timestamp: Date): MonitoringErrorContextBuilder {
    this._context.timestamp = timestamp;
    return this;
  }

  /**
   * Add a single tag
   */
  tag(key: string, value: string): MonitoringErrorContextBuilder {
    if (!this._context.tags) {
      this._context.tags = {};
    }
    this._context.tags[key] = value;
    return this;
  }

  /**
   * Add multiple tags
   */
  tags(tags: Record<string, string>): MonitoringErrorContextBuilder {
    this._context.tags = { ...this._context.tags, ...tags };
    return this;
  }

  /**
   * Add a single metadata entry
   */
  meta(key: string, value: unknown): MonitoringErrorContextBuilder {
    if (!this._context.metadata) {
      this._context.metadata = {};
    }
    this._context.metadata[key] = value;
    return this;
  }

  /**
   * Add multiple metadata entries
   */
  metadata(metadata: Record<string, unknown>): MonitoringErrorContextBuilder {
    this._context.metadata = { ...this._context.metadata, ...metadata };
    return this;
  }

  /**
   * Set user context (userId, sessionId, component) in one call
   */
  userContext(context: {
    userId?: string;
    sessionId?: string;
    component?: string;
  }): MonitoringErrorContextBuilder {
    if (context.userId) {
      this._context.userId = context.userId;
    }
    if (context.sessionId) {
      this._context.sessionId = context.sessionId;
    }
    if (context.component) {
      this._context.component = context.component;
    }
    return this;
  }

  /**
   * Add system information automatically
   */
  withSystemInfo(): MonitoringErrorContextBuilder {
    const systemInfo = {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      url: typeof window !== "undefined" ? window.location.href : "Unknown",
      timestamp: new Date().toISOString(),
    };
    return this.metadata(systemInfo);
  }

  /**
   * Build the final MonitoringErrorContext object
   */
  build(): MonitoringErrorContext {
    return {
      timestamp: this._context.timestamp || new Date(),
      level: this._context.level,
      component: this._context.component,
      userId: this._context.userId,
      sessionId: this._context.sessionId,
      tags: this._context.tags,
      metadata: this._context.metadata,
    };
  }
}

/**
 * Builder class for creating MonitoringErrorData with fluent interface
 */
export class MonitoringErrorBuilder {
  private _data: Partial<MonitoringErrorData> = {};

  constructor(message: string) {
    this._data.message = message;
    this._data.timestamp = new Date();
  }

  /**
   * Static factory method to create a new builder
   */
  static create(message: string): MonitoringErrorBuilder {
    return new MonitoringErrorBuilder(message);
  }

  /**
   * Static factory methods for different error levels
   */
  static error(message: string): MonitoringErrorBuilder {
    return new MonitoringErrorBuilder(message).level("error");
  }

  static warning(message: string): MonitoringErrorBuilder {
    return new MonitoringErrorBuilder(message).level("warning");
  }

  static info(message: string): MonitoringErrorBuilder {
    return new MonitoringErrorBuilder(message).level("info");
  }

  static debug(message: string): MonitoringErrorBuilder {
    return new MonitoringErrorBuilder(message).level("debug");
  }

  static fatal(message: string): MonitoringErrorBuilder {
    return new MonitoringErrorBuilder(message).level("fatal");
  }

  /**
   * Set error level
   */
  level(level: MonitoringErrorLevel): MonitoringErrorBuilder {
    this._data.level = level;
    return this;
  }

  /**
   * Set error source
   */
  source(source: string): MonitoringErrorBuilder {
    this._data.source = source;
    return this;
  }

  /**
   * Set component name
   */
  component(component: string): MonitoringErrorBuilder {
    this._data.component = component;
    return this;
  }

  /**
   * Set user ID
   */
  userId(userId: string): MonitoringErrorBuilder {
    this._data.userId = userId;
    return this;
  }

  /**
   * Set session ID
   */
  sessionId(sessionId: string): MonitoringErrorBuilder {
    this._data.sessionId = sessionId;
    return this;
  }

  /**
   * Set timestamp
   */
  timestamp(timestamp: Date): MonitoringErrorBuilder {
    this._data.timestamp = timestamp;
    return this;
  }

  /**
   * Add a single tag
   */
  tag(key: string, value: string): MonitoringErrorBuilder {
    if (!this._data.tags) {
      this._data.tags = {};
    }
    this._data.tags[key] = value;
    return this;
  }

  /**
   * Add multiple tags
   */
  tags(tags: Record<string, string>): MonitoringErrorBuilder {
    this._data.tags = { ...this._data.tags, ...tags };
    return this;
  }

  /**
   * Add a single metadata entry
   */
  meta(key: string, value: unknown): MonitoringErrorBuilder {
    if (!this._data.metadata) {
      this._data.metadata = {};
    }
    this._data.metadata[key] = value;
    return this;
  }

  /**
   * Add multiple metadata entries
   */
  metadata(metadata: Record<string, unknown>): MonitoringErrorBuilder {
    this._data.metadata = { ...this._data.metadata, ...metadata };
    return this;
  }

  /**
   * Set user context (userId, sessionId, component) in one call
   */
  context(context: {
    userId?: string;
    sessionId?: string;
    component?: string;
  }): MonitoringErrorBuilder {
    if (context.userId) {
      this._data.userId = context.userId;
    }
    if (context.sessionId) {
      this._data.sessionId = context.sessionId;
    }
    if (context.component) {
      this._data.component = context.component;
    }
    return this;
  }

  /**
   * Add system information automatically
   */
  withSystemInfo(): MonitoringErrorBuilder {
    const systemInfo = {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      url: typeof window !== "undefined" ? window.location.href : "Unknown",
      timestamp: new Date().toISOString(),
    };
    return this.metadata(systemInfo);
  }

  /**
   * Build the final MonitoringErrorData object
   */
  build(): MonitoringErrorData {
    if (!this._data.message) {
      throw new Error("Message is required for MonitoringErrorData");
    }

    return {
      message: this._data.message,
      level: this._data.level || "error",
      timestamp: this._data.timestamp || new Date(),
      source: this._data.source,
      component: this._data.component,
      userId: this._data.userId,
      sessionId: this._data.sessionId,
      tags: this._data.tags,
      metadata: this._data.metadata,
    };
  }
}

export const monitoringErrorLevels = {
  Debug: "debug",
  Info: "info",
  Warning: "warning",
  Error: "error",
  Fatal: "fatal",
} as const;

export type MonitoringErrorLevel =
  (typeof monitoringErrorLevels)[keyof typeof monitoringErrorLevels];
