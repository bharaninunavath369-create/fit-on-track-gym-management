
const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

// GET all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    console.error("Fetch members error:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST new member
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, age, membership } = req.body;

    // Check required fields
    if (!name || !email || !phone || !age || !membership) {
      return res.status(400).json({
        message: "Please provide name, email, phone, age and membership.",
      });
    }

    // Calculate membership dates
    const duration = {
      Monthly: 1,
      Quarterly: 3,
      Yearly: 12,
    };

    if (!duration[membership]) {
      return res.status(400).json({
        message: "Invalid membership plan.",
      });
    }

    const startDate = req.body.startDate
      ? new Date(req.body.startDate)
      : new Date();

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration[membership]);

    const member = new Member({
      ...req.body,
      startDate,
      endDate,
    });

    const savedMember = await member.save();

    res.status(201).json(savedMember);
  } catch (error) {
    console.error("Save member error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email address is already registered.",
      });
    }

    res.status(400).json({
      message: error.message,
    });
  }
});

// UPDATE member
router.put("/:id", async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.json(updatedMember);
  } catch (error) {
    console.error("Update member error:", error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE member
router.delete("/:id", async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);

    if (!deletedMember) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.json({
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Delete member error:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
