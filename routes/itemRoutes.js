import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

/**
 * @desc Get all items (with optional filters)
 * @route GET /api/items
 * @query ?country=&sector=&topic=&pestle=&region=&start_year=&end_year=
 */
router.get("/", async (req, res) => {
  try {
    const { country, sector, topic, pestle, region, start_year, end_year } = req.query;

    const filter = {};
    if (country) filter.country = country;
    if (sector) filter.sector = sector;
    if (topic) filter.topic = topic;
    if (pestle) filter.pestle = pestle;
    if (region) filter.region = region;
    if (start_year) filter.start_year = start_year;
    if (end_year) filter.end_year = end_year;

    const items = await Item.find(filter);
    res.json(items);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @desc Get single item by ID
 * @route GET /api/items/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @desc Add new item
 * @route POST /api/items
 */
router.post("/", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(400).json({ message: "Failed to add item" });
  }
});

/**
 * @desc Update item by ID
 * @route PUT /api/items/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(400).json({ message: "Failed to update item" });
  }
});

/**
 * @desc Delete item by ID
 * @route DELETE /api/items/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(400).json({ message: "Failed to delete item" });
  }
});

/**
 * @desc Get distinct filter values (for dropdowns in frontend)
 * @route GET /api/items/filters
 */
router.get("/filters/all", async (req, res) => {
  try {
    const filters = {
      countries: await Item.distinct("country"),
      sectors: await Item.distinct("sector"),
      topics: await Item.distinct("topic"),
      pestles: await Item.distinct("pestle"),
      regions: await Item.distinct("region"),
      sources: await Item.distinct("source"),
      swots: await Item.distinct("swot"), // in case data contains SWOT
      end_years: await Item.distinct("end_year"),
      start_years: await Item.distinct("start_year"),
    };
    res.json(filters);
  } catch (err) {
    console.error("Error fetching filters:", err);
    res.status(500).json({ message: "Failed to load filters" });
  }
});

/**
 * @desc Get filtered data (for charts)
 * @route POST /api/items/filter
 * @body { region, sector, topic, end_year, country, pestle, source }
 */
router.post("/filter", async (req, res) => {
  try {
    const filter = {};
    const { region, sector, topic, end_year, country, pestle, source } = req.body;

    if (region) filter.region = region;
    if (sector) filter.sector = sector;
    if (topic) filter.topic = topic;
    if (end_year) filter.end_year = end_year;
    if (country) filter.country = country;
    if (pestle) filter.pestle = pestle;
    if (source) filter.source = source;

    const filteredData = await Item.find(filter);
    res.json(filteredData);
  } catch (err) {
    console.error("Error filtering data:", err);
    res.status(500).json({ message: "Failed to filter data" });
  }
});

/**
 * @desc Aggregated statistics for visualizations
 * @route GET /api/items/stats
 */
router.get("/stats/aggregate", async (req, res) => {
  try {
    // Example 1: Average Intensity by Region
    const avgIntensityByRegion = await Item.aggregate([
      { $match: { intensity: { $ne: null } } },
      { $group: { _id: "$region", avgIntensity: { $avg: "$intensity" } } },
      { $sort: { avgIntensity: -1 } }
    ]);

    // Example 2: Count by Topic
    const countByTopic = await Item.aggregate([
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Example 3: Average Likelihood by Sector
    const avgLikelihoodBySector = await Item.aggregate([
      { $match: { likelihood: { $ne: null } } },
      { $group: { _id: "$sector", avgLikelihood: { $avg: "$likelihood" } } },
      { $sort: { avgLikelihood: -1 } }
    ]);

    // Example 4: Average Relevance by Year
    const avgRelevanceByYear = await Item.aggregate([
      { $match: { relevance: { $ne: null, $ne: "" } } },
      { $group: { _id: "$end_year", avgRelevance: { $avg: "$relevance" } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      avgIntensityByRegion,
      countByTopic,
      avgLikelihoodBySector,
      avgRelevanceByYear
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

export default router;
