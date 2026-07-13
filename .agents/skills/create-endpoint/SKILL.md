---
name: create-endpoint
description: A step-by-step workflow to create a new REST API resource or endpoint in the Attendy application. Equip this skill when adding a new database model, controller, route, or mounting it in app.js.
---

# Creating a New API Resource / Endpoint in Attendy

Follow this runbook to implement a new database-backed resource or endpoint.

---

## Step 1: Create the Mongoose Model

Create a model in `models/[name].model.js` using ESM syntax and the existing structure:

```javascript
import mongoose, { Schema } from "mongoose";

const resourceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Add additional fields here...
  },
  { timestamps: true }
);

export const Resource = mongoose.model("Resource", resourceSchema);
```

## Step 2: Implement the Controller Actions

Create controller functions in `controllers/[name].controllers.js`. Wrap every controller in `asyncHandler` and use `ApiResponse` and `ApiError`:

```javascript
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Resource } from "../models/[name].model.js";

const createResource = asyncHandler(async (req, res) => {
  // 1. Validate inputs or permissions
  // 2. Perform DB operations
  // 3. Return response using ApiResponse
});

export { createResource };
```

## Step 3: Define routes

Create route definitions in `routes/[name].routes.js`. Always check JWT using the `verifyJWT` middleware:

```javascript
import { Router } from "express";
import { createResource } from "../controllers/[name].controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createResource);

export default router;
```

## Step 4: Mount the router in app.js

Import the new router and register it using the pattern `app.use("/api/v1/[name]", resourceRouter)` inside `app.js`.
