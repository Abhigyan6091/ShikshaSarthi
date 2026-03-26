const hasOwn = Object.prototype.hasOwnProperty;

const now = () => new Date();

function addSyncFields(schema) {
  if (!schema.path("updatedAt")) {
    schema.add({
      updatedAt: { type: Date, default: Date.now, index: true },
    });
  }

  if (!schema.path("isDeleted")) {
    schema.add({
      isDeleted: { type: Boolean, default: false, index: true },
    });
  }

  if (!schema.path("synced")) {
    schema.add({
      synced: { type: Boolean, default: false, index: true },
    });
  }
}

function shouldIncludeDeleted(query) {
  if (!query || typeof query.getOptions !== "function") {
    return false;
  }

  const options = query.getOptions() || {};
  return Boolean(options.includeDeleted || options.withDeleted);
}

function enforceActiveRecordsFilter() {
  if (shouldIncludeDeleted(this)) {
    return;
  }

  const query = this.getQuery ? this.getQuery() : {};
  if (query && hasOwn.call(query, "isDeleted")) {
    return;
  }

  this.where({ isDeleted: false });
}

function injectWriteMetadata(next) {
  const options = this.getOptions ? this.getOptions() : {};
  if (options && options.skipSyncMetadata) {
    return next();
  }

  const update = this.getUpdate();
  if (!update) {
    return next();
  }

  if (Array.isArray(update)) {
    return next();
  }

  const isOperatorUpdate = Object.keys(update).some((key) => key.startsWith("$"));

  if (!isOperatorUpdate) {
    if (!options.preserveUpdatedAt) {
      update.updatedAt = now();
    }

    if (options.markSynced === true) {
      update.synced = true;
    } else if (!hasOwn.call(update, "synced")) {
      update.synced = false;
    }

    this.setUpdate(update);
    return next();
  }

  update.$set = update.$set || {};

  if (!options.preserveUpdatedAt) {
    update.$set.updatedAt = now();
  }

  if (options.markSynced === true) {
    update.$set.synced = true;
  } else if (!hasOwn.call(update.$set, "synced")) {
    update.$set.synced = false;
  }

  this.setUpdate(update);
  return next();
}

function injectAggregateFilter(next) {
  const options = this.options || {};
  if (options.includeDeleted || options.withDeleted) {
    return next();
  }

  const pipeline = this.pipeline();
  const hasDeletedFilter = pipeline.some((stage) => {
    if (!stage || typeof stage !== "object") {
      return false;
    }

    if (!stage.$match || typeof stage.$match !== "object") {
      return false;
    }

    return hasOwn.call(stage.$match, "isDeleted");
  });

  if (!hasDeletedFilter) {
    pipeline.unshift({ $match: { isDeleted: false } });
  }

  next();
}

module.exports = function syncMetadataPlugin(schema) {
  addSyncFields(schema);

  schema.pre("save", function syncSaveHook(next) {
    if (this.$locals && this.$locals.skipSyncMetadata) {
      return next();
    }

    this.updatedAt = now();

    if (typeof this.isDeleted === "undefined") {
      this.isDeleted = false;
    }

    if (this.$locals && this.$locals.markSynced === true) {
      this.synced = true;
    } else if (typeof this.synced === "undefined") {
      this.synced = false;
    } else if (this.isModified()) {
      this.synced = false;
    }

    next();
  });

  // Hide soft-deleted records by default.
  schema.pre("find", enforceActiveRecordsFilter);
  schema.pre("findOne", enforceActiveRecordsFilter);
  schema.pre("countDocuments", enforceActiveRecordsFilter);
  schema.pre("distinct", enforceActiveRecordsFilter);
  schema.pre("findOneAndUpdate", enforceActiveRecordsFilter);
  schema.pre("findOneAndReplace", enforceActiveRecordsFilter);
  schema.pre("updateOne", enforceActiveRecordsFilter);
  schema.pre("updateMany", enforceActiveRecordsFilter);

  // Keep update metadata in sync for normal writes.
  schema.pre("findOneAndUpdate", injectWriteMetadata);
  schema.pre("findOneAndReplace", injectWriteMetadata);
  schema.pre("replaceOne", injectWriteMetadata);
  schema.pre("updateOne", injectWriteMetadata);
  schema.pre("updateMany", injectWriteMetadata);

  // Exclude soft deleted docs in aggregates unless explicitly requested.
  schema.pre("aggregate", injectAggregateFilter);
};
