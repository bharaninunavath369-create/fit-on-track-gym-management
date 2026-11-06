
const express = require("express");
const router = express.Router();
const Trainer = require("../models/Trainer");

// GET all trainers
router.get("/", async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one trainer
router.get("/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json(trainer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ADD trainer
router.post("/", async (req, res) => {
  try {
    const trainer = new Trainer(req.body);
    const savedTrainer = await trainer.save();

    res.status(201).json(savedTrainer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE trainer
router.put("/:id", async (req, res) => {
  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTrainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json(updatedTrainer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE trainer
router.delete("/:id", async (req, res) => {
  try {
    const deletedTrainer = await Trainer.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTrainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
