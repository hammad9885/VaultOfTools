const { isDBConnected } = require("../config/db");

async function getStore() {
  if (isDBConnected()) {
    const Consultation = require("../models/Consultation");
    return { type: "mongo", Consultation };
  }
  return { type: "memory", store: require("../lib/memoryStore") };
}

exports.createConsultation = async (req, res, next) => {
  try {
    const { name, email, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
    }

    const db = await getStore();
    let result;

    if (db.type === "mongo") {
      result = await db.Consultation.create({ name, email, company, message });
    } else {
      result = await db.store.createConsultation({ name, email, company, message });
    }

    res.status(201).json({ success: true, message: "Consultation request received" });
  } catch (err) {
    next(err);
  }
};

exports.getAllConsultations = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const db = await getStore();
    let consultations;

    if (db.type === "mongo") {
      consultations = await db.Consultation.find(filter)
        .sort({ createdAt: -1 })
        .select("-__v");
    } else {
      consultations = await db.store.getConsultations(filter);
    }

    res.json(consultations);
  } catch (err) {
    next(err);
  }
};

exports.updateConsultationStatus = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status } = req.body;
    if (!["new", "contacted", "qualified", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const db = await getStore();
    let consultation;

    if (db.type === "mongo") {
      consultation = await db.Consultation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
    } else {
      consultation = await db.store.updateConsultationStatus(req.params.id, status);
    }

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    res.json(consultation);
  } catch (err) {
    next(err);
  }
};
