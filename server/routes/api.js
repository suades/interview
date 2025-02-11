const express = require("express");
const router = express.Router();

const sessionStorage = new Map();

// Validate matrix dimensions and values
const validateMatrix = (matrix) => {
  if (!Array.isArray(matrix) || !matrix.length) {
    throw new Error("Invalid matrix: must be a non-empty 2D array");
  }

  const size = matrix.length;

  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== size) {
      throw new Error("Invalid matrix: must be square");
    }

    for (const value of row) {
      if (typeof value !== "number" || value < 0 || value > 1) {
        throw new Error(
          "Invalid matrix: values must be numbers between 0 and 1"
        );
      }
    }
  }
};

const customSort = (arr) => {
  const n = arr.length;
  const sorted = [...arr];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (sorted[j] < sorted[j + 1]) {
        // Swap elements
        const temp = sorted[j];
        sorted[j] = sorted[j + 1];
        sorted[j + 1] = temp;
      }
    }
  }

  return sorted;
};

const computeMatrixProperties = (matrix) => {
  const size = matrix.length;

  const degreeMatrix = matrix.map((row) =>
    row.reduce((sum, val) => sum + val, 0)
  );

  let maxSum = -Infinity;
  let maxRowIndex = 0;

  matrix.forEach((row, index) => {
    const sum = row.reduce((acc, val) => acc + val, 0);
    if (sum > maxSum) {
      maxSum = sum;
      maxRowIndex = index;
    }
  });
  const sortedMaxRow = customSort(matrix[maxRowIndex]);

  return {
    degreeMatrix,
    maxRowIndex,
    sortedMaxRow,
  };
};

// Process Matrix endpoint
router.put("/process-matrix", (req, res) => {
  try {
    const { matrix } = req.body;

    validateMatrix(matrix);
    const sessionId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);

    const results = computeMatrixProperties(matrix);
    sessionStorage.set(sessionId, {
      matrix,
      results,
      timestamp: Date.now(),
    });
    res.json({
      sessionId,
      ...results,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Processing failed",
    });
  }
});

// Delete session endpoint
router.delete("/delete-session/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  if (sessionStorage.has(sessionId)) {
    sessionStorage.delete(sessionId);
    res.json({ message: "Session deleted successfully" });
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

module.exports = router;
