import Albums from "../models/Albums.js";
import { APIError } from "../errors/custom.js";

export async function getAllAlbums(req, res) {
  // Implementation here
  try {
    const {
      artist,
      title,
      year,
      genre,
      sort,
      numericFilters,
      fields,
      search,
      startYear,
      endYear,
    } = req.query;
    const queryObject = {};
    const page = Math.max(1, Number(req.query.page) || 1); // Ensure page >= 1
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10)); // Limit between 1-100
    const skip = (page - 1) * limit;

    if (artist) {
      queryObject.artist = { $regex: artist, $options: "i" };
    }

    if (title) {
      queryObject.title = { $regex: title, $options: "i" };
    }

    if (genre) {
      queryObject.genre = genre;
    }

    if (year) {
      queryObject.year = Number(year);
    }

    if (numericFilters) {
      const operatorMap = {
        ">": "$gt",
        ">=": "$gte",
        "=": "$eq",
        "<": "$lt",
        "<=": "$lte",
      };
      const regEx = /\b(>|>=|=|<|<=)\b/g;
      let filters = numericFilters.replace(
        regEx,
        (match) => `-${operatorMap[match]}-`,
      );
      console.log(filters);
      const options = ["year"];

      filters = filters.split(",").forEach((item) => {
        const [field, operator, value] = item.split("-");
        if (options.includes(field)) {
          queryObject[field] = { [operator]: Number(value) };
          //console.log(operator);
        }
      });
    }
    //console.log(queryObject);

    if (search) {
      queryObject.$or = [
        { artist: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    if (startYear || endYear) {
      queryObject.year = {};

      if (startYear) {
        queryObject.year.$gte = Number(startYear);
      }

      if (endYear) {
        queryObject.year.$lte = Number(endYear);
      }
    }

    let result = Albums.find(queryObject);

    if (fields) {
      const fieldList = fields.split(",").join(" ");
      result = result.select(fieldList);
    }

    if (sort) {
      const sortList = sort.split(",").join(" ");
      result = result.sort(sortList);
    } else {
      result = result.sort("artist");
    }

    const albums = await result.skip(skip).limit(limit); //Albums.find({}).sort("artist, -year"); //await loadAlbums();

    const totalProducts = await Albums.countDocuments(queryObject);
    const totalPages = Math.ceil(totalProducts / limit);
    res.status(200).json({
      albums,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Album controller error:", error);
    res.status(500).json({ error: "Failed to load albums" });
  }
}

export const getuserAlbums = async (req, res) => {
  try {
    const albums = await Albums.find({
      createdBy: req.user.id,
    });
    console.log(req.user.id);

    res.status(200).json({ albums });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function getAlbumById(req, res) {
  const { id } = req.params;
  const album = await Albums.findById(id); //.lean();

  if (!album) {
    throw new APIError(`Album not found!`, 404);
  }

  res.json({ ...album.toObject(), isClassic: album.isClassic() });
}

export async function createAlbum(req, res) {
  // Implementation here
  const { artist, title, year, genre, tracks } = req.body;

  if (!artist || !title) {
    //return res.status(400).json({ error: "Artist and title are required" });
    throw new APIError(`Artist and title are required!`, 400);
  }

  const newAlbum = {
    artist,
    title,
    year,
    genre,
    tracks,
    createdBy: req.user._id,
  };

  try {
    const album = await Albums.create(newAlbum);
    res.status(201).json(album);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateAlbum(req, res) {
  // Implementation here
  //const id = Number(req.params.id);
  const { id } = req.params;
  const { artist, title, year, genre, tracks } = req.body;

  // const albums = await loadAlbums();
  // const album = albums.find((a) => a.id === id);
  const album = await Albums.findById(id).lean();

  if (!album) {
    throw new APIError(`Album not found!`, 404);
    //return res.status(404).json({ message: "Album not found" });
  }

  album.artist = artist;
  album.title = title;
  album.year = year;
  album.genre = genre;
  album.tracks = tracks;

  //await saveAlbums(albums);
  Albums.findByIdAndUpdate(id, album);

  res.json(album);
}

export async function deleteAlbum(req, res, next) {
  // Implementation here
  console.log(req.params);
  const { id } = req.params;
  try {
    const album = await Albums.findByIdAndDelete(id).exec();
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Album deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export const getAlbumsByGenre = async (req, res) => {
  try {
    const albums = await Albums.findByGenre(req.params.genre);
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
